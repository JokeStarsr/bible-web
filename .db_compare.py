#!/usr/bin/env python3
"""Compare parser output (via API) vs DB V29 Aug6 record.

Since we have SSH access, query DB directly for the Aug6 record, then
call the API (after generating a JWT from JWT_SECRET) to get parser output,
and diff the two.
"""
import json
import socket

HOST = "115.159.221.62"
SSH_PORT = 22


def make_sock():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(30)
    s.connect(("127.0.0.1", 18080))
    req = f"CONNECT {HOST}:{SSH_PORT} HTTP/1.1\r\nHost: {HOST}:{SSH_PORT}\r\n\r\n".encode()
    s.sendall(req)
    data = s.recv(4096)
    assert b"200" in data.split(b"\r\n")[0], data[:80]
    return s


def run(client, cmd, timeout=60):
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True, timeout=timeout)
    rc = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace")
    return rc, out


def main():
    import paramiko
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=SSH_PORT, username="root",
                   password="!c7W/@8L_*6mEJXQ", sock=make_sock(), timeout=30)

    # 1. 从 DB 取 Aug6 记录（V29 手写 SQL 写入），输出关键字段
    print("=== DB Aug6 record (V29 handwritten SQL) ===")
    sql = ("SELECT scripture_reference, "
           "length(scripture_text) AS st_len, "
           "length(commentary) AS cm_len, "
           "length(hymn) AS hy_len, "
           "(scripture_text LIKE '%16 耶和华的话又临到我说：%') AS has_v16_cn, "
           "(scripture_text LIKE '%16 Again the word of the LORD%') AS has_v16_en, "
           "(scripture_text LIKE '%31 那时，你们必追想%') AS has_v31_cn, "
           "(scripture_text NOT LIKE '%31 Then%') AS no_v31_en, "
           "(commentary LIKE '今日经文摘要%') AS cm_starts_summary, "
           "(commentary LIKE '%被玷污的神的名｜36：16～20%') AS has_title1, "
           "(commentary LIKE '%从污秽到洁净｜36：21～31%') AS has_title2, "
           "(commentary LIKE '%默想散文%祂装作软弱的理由%山寨版的神%') AS has_essay_head, "
           "(commentary NOT LIKE '%……%') AS no_decor, "
           "(hymn LIKE '十字架的道路，殉道者的生命%') AS hymn_ok "
           "FROM qt_daily_content WHERE qt_date='2026-08-06';")
    rc, out = run(client,
        "docker exec bible-postgres psql -U bible_user -d bible -t -A -F '|' -c \"" + sql.replace('"', '\\"') + "\"")
    print(out.strip())

    # 2. 取 DB scripture_text 的节块数（按 \n\n 切）
    print("\n=== DB scripture_text verse block count ===")
    rc, out = run(client,
        "docker exec bible-postgres psql -U bible_user -d bible -t -A -c \"SELECT array_length(string_to_array(scripture_text, E'\\\\n\\\\n'), 1) FROM qt_daily_content WHERE qt_date='2026-08-06';\"")
    print("db verse blocks =", out.strip())

    # 3. 取 DB commentary 块数
    print("\n=== DB commentary block count ===")
    rc, out = run(client,
        "docker exec bible-postgres psql -U bible_user -d bible -t -A -c \"SELECT array_length(string_to_array(commentary, E'\\\\n\\\\n'), 1) FROM qt_daily_content WHERE qt_date='2026-08-06';\"")
    print("db commentary blocks =", out.strip())

    # 4. 取 JWT_SECRET 并生成 token
    print("\n=== generate JWT for admin ===")
    rc, out = run(client, "grep JWT_SECRET /opt/bible-web/.env 2>/dev/null | head -1")
    print("env line:", out.strip()[:60] + "...")
    # 取 admin user id
    rc, out = run(client,
        "docker exec bible-postgres psql -U bible_user -d bible -t -A -c \"SELECT id FROM users WHERE email='852341467@qq.com';\"")
    user_id = out.strip()
    print("admin user_id =", user_id)

    client.close()


if __name__ == "__main__":
    main()
