#!/usr/bin/env python3
"""Full E2E: generate JWT, call text-format-preview API, diff vs DB V29 Aug6 record."""
import json
import socket
import hmac
import hashlib
import base64
import time

HOST = "115.159.221.62"
SSH_PORT = 22
TABLE = "qt_daily_contents"
ADMIN_EMAIL = "852341467@qq.com"


def make_sock():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(30)
    s.connect(("127.0.0.1", 18080))
    req = f"CONNECT {HOST}:{SSH_PORT} HTTP/1.1\r\nHost: {HOST}:{SSH_PORT}\r\n\r\n".encode()
    s.sendall(req)
    data = s.recv(4096)
    assert b"200" in data.split(b"\r\n")[0], data[:80]
    return s


def run(client, cmd, timeout=90):
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True, timeout=timeout)
    rc = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace")
    return rc, out


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def make_jwt(secret: str, user_id: str, username: str) -> str:
    """HS256 JWT; key = secret.getBytes() (matches JwtUtil derivation)."""
    header = b64url(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    now = int(time.time())
    payload = b64url(json.dumps({
        "sub": user_id,
        "username": username,
        "iat": now,
        "exp": now + 7200
    }).encode())
    signing_input = f"{header}.{payload}".encode()
    sig = hmac.new(secret.encode(), signing_input, hashlib.sha256).digest()
    return f"{header}.{payload}.{b64url(sig)}"


def _show_diff(a: str, b: str):
    """显示两个字符串首个差异区域。"""
    limit = min(len(a), len(b))
    i = 0
    while i < limit and a[i] == b[i]:
        i += 1
    ctx_a = a[max(0, i - 30):i + 30]
    ctx_b = b[max(0, i - 30):i + 30]
    print(f"  首个差异位置 idx={i} (API len={len(a)} DB len={len(b)})")
    print(f"  API: ...{ctx_a!r}...")
    print(f"  DB : ...{ctx_b!r}...")


def main():
    import paramiko
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=SSH_PORT, username="root",
                   password="!c7W/@8L_*6mEJXQ", sock=make_sock(), timeout=30)

    # 1. 取 JWT_SECRET + user_id + username
    rc, envline = run(client, "grep '^JWT_SECRET=' /opt/bible-web/.env | head -1")
    jwt_secret = envline.strip().split("=", 1)[1]
    rc, uid = run(client,
        f"docker exec bible-postgres psql -U bible_user -d bible -t -A -c \"SELECT id FROM users WHERE email='{ADMIN_EMAIL}';\"")
    user_id = uid.strip()
    rc, uname = run(client,
        f"docker exec bible-postgres psql -U bible_user -d bible -t -A -c \"SELECT username FROM users WHERE email='{ADMIN_EMAIL}';\"")
    username = uname.strip()
    print(f"secret_len={len(jwt_secret)} user_id={user_id} username={username}")

    token = make_jwt(jwt_secret, user_id, username)
    print(f"jwt generated, len={len(token)}")

    # 2. admin/check 验证 token
    rc, out = run(client, f"curl -s http://localhost:8080/api/v1/qt/admin/check -H 'Authorization: Bearer {token}'")
    print("admin/check =", out.strip())

    # 3. 调 text-format-preview
    print("\n=== call text-format-preview ===")
    with open("/workspace/backend/src/test/java/com/bible/module/qt/service/QtFormatParserTest.java",
              encoding="utf-8") as f:
        content = f.read()
    s = content.index('AUG6_RAW = """') + len('AUG6_RAW = """')
    e = content.index('"""', s)
    raw_text = content[s:e].lstrip("\n")

    body_json = json.dumps({"text": raw_text, "targetDate": "2026-08-06"})
    # 写到临时文件避免 shell 转义问题
    rc, out = run(client,
        f"cat > /tmp/qt_payload.json <<'PAYLOAD_EOF'\n{body_json}\nPAYLOAD_EOF\n"
        f"curl -s -X POST http://localhost:8080/api/v1/qt/admin/text-format-preview "
        f"-H 'Content-Type: application/json' -H 'Authorization: Bearer {token}' "
        f"-d @/tmp/qt_payload.json")
    try:
        resp = json.loads(out)
    except Exception as ex:
        print("RESP PARSE FAIL:", ex)
        print("RAW:", out[:800])
        client.close()
        return

    if not resp.get("success"):
        print("API FAIL:", resp.get("message"))
        print("RAW:", out[:800])
        client.close()
        return

    item = resp["data"]["items"][0]
    api_st = item["scriptureText"]
    api_cm = item["commentary"]
    api_hy = item["hymn"]
    print(f"API: title={item['title']} ref={item['scriptureReference']}")
    print(f"API: scripture blocks={len(api_st.split(chr(10)+chr(10)))} len={len(api_st)}")
    print(f"API: commentary blocks={len(api_cm.split(chr(10)+chr(10)))} len={len(api_cm)}")
    print(f"API: hymn len={len(api_hy)}")

    # 4. DB 取 V29 Aug6 记录
    print("\n=== DB V29 Aug6 record ===")
    rc, out = run(client,
        f"docker exec bible-postgres psql -U bible_user -d bible -t -A -F '|' -c "
        f"\"SELECT length(scripture_text), length(commentary), length(hymn) FROM {TABLE} WHERE qt_date='2026-08-06';\"")
    print("DB lengths:", out.strip())
    db_st_len, db_cm_len, db_hy_len = (int(x) for x in out.strip().split("|"))

    rc, out = run(client,
        f"docker exec bible-postgres psql -U bible_user -d bible -t -A -c "
        f"\"SELECT array_length(string_to_array(scripture_text, E'\\\\n\\\\n'), 1) FROM {TABLE} WHERE qt_date='2026-08-06';\"")
    db_st_blocks = int(out.strip())
    rc, out = run(client,
        f"docker exec bible-postgres psql -U bible_user -d bible -t -A -c "
        f"\"SELECT array_length(string_to_array(commentary, E'\\\\n\\\\n'), 1) FROM {TABLE} WHERE qt_date='2026-08-06';\"")
    db_cm_blocks = int(out.strip())
    print(f"DB: scripture blocks={db_st_blocks} commentary blocks={db_cm_blocks}")

    # 5. 对比
    print("\n=== DIFF RESULT ===")
    print(f"scripture_text len:   API={len(api_st)}  DB={db_st_len}  {'OK' if len(api_st)==db_st_len else 'MISMATCH'}")
    print(f"scripture_text blocks:API={len(api_st.split(chr(10)+chr(10)))}  DB={db_st_blocks}  {'OK' if len(api_st.split(chr(10)+chr(10)))==db_st_blocks else 'MISMATCH'}")
    print(f"commentary len:       API={len(api_cm)}  DB={db_cm_len}  {'OK' if len(api_cm)==db_cm_len else 'MISMATCH'}")
    print(f"commentary blocks:    API={len(api_cm.split(chr(10)+chr(10)))}  DB={db_cm_blocks}  {'OK' if len(api_cm.split(chr(10)+chr(10)))==db_cm_blocks else 'MISMATCH'}")
    print(f"hymn len:             API={len(api_hy)}  DB={db_hy_len}  {'OK' if len(api_hy)==db_hy_len else 'MISMATCH'}")

    # 精确字符串对比（取 DB 全文）
    # 归一化：CRLF→LF（V29 文件 CRLF 为编码产物），去尾换行（DB 末尾 \r 为 TRIM 未清的 CRLF 残留）
    def norm(s):
        return s.replace("\r\n", "\n").replace("\r", "\n").rstrip("\n")

    rc, db_st = run(client,
        f"docker exec bible-postgres psql -U bible_user -d bible -t -A -c "
        f"\"SELECT scripture_text FROM {TABLE} WHERE qt_date='2026-08-06';\"")
    db_st = norm(db_st)
    rc, db_cm = run(client,
        f"docker exec bible-postgres psql -U bible_user -d bible -t -A -c "
        f"\"SELECT commentary FROM {TABLE} WHERE qt_date='2026-08-06';\"")
    db_cm = norm(db_cm)
    rc, db_hy = run(client,
        f"docker exec bible-postgres psql -U bible_user -d bible -t -A -c "
        f"\"SELECT hymn FROM {TABLE} WHERE qt_date='2026-08-06';\"")
    db_hy = norm(db_hy)

    api_st_n = norm(api_st)
    api_cm_n = norm(api_cm)
    api_hy_n = norm(api_hy)

    st_match = api_st_n == db_st
    cm_match = api_cm_n == db_cm
    hy_match = api_hy_n == db_hy
    print(f"\nscripture_text EXACT (normalized): {'MATCH ✓' if st_match else 'DIFF ✗'}")
    print(f"commentary EXACT (normalized):      {'MATCH ✓' if cm_match else 'DIFF ✗'}")
    print(f"hymn EXACT (normalized):            {'MATCH ✓' if hy_match else 'DIFF ✗'}")

    if not st_match:
        print("\n--- scripture_text diff ---")
        _show_diff(api_st_n, db_st)
    if not cm_match:
        print("\n--- commentary diff ---")
        _show_diff(api_cm_n, db_cm)
    if not hy_match:
        print("\n--- hymn diff ---")
        _show_diff(api_hy_n, db_hy)

    client.close()


if __name__ == "__main__":
    main()
