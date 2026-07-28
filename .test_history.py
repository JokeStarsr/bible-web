#!/usr/bin/env python3
"""自测 QT 历史记录新接口：all-responses + delete-by-id"""
import sys, os, json, base64, hmac, hashlib, time, subprocess

JWT_SECRET = sys.argv[1]
HOST = "http://localhost:8080"
USER_ID = "23d07428-5cd0-467e-ae06-bd65e62b884c"
USERNAME = "Super@Joker"

def b64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

# 构造 JWT
header = {"alg": "HS256", "typ": "JWT"}
now = int(time.time())
payload = {"sub": USER_ID, "username": USERNAME, "iat": now, "exp": now + 7200}
h = b64url(json.dumps(header).encode())
p = b64url(json.dumps(payload).encode())
sig = hmac.new(JWT_SECRET.encode(), f"{h}.{p}".encode(), hashlib.sha256).digest()
token = f"{h}.{p}.{b64url(sig)}"

# 测试1: GET /all-responses
print("=" * 50)
print("[1] GET /api/v1/qt/all-responses")
r = subprocess.run(["curl", "-s", "-w", "\n%{http_code}", "--max-time", "15",
                    "-H", f"Authorization: Bearer {token}",
                    f"{HOST}/api/v1/qt/all-responses"],
                   capture_output=True, text=True)
lines = r.stdout.rsplit("\n", 1)
code = lines[-1]
body = lines[0] if len(lines) > 1 else r.stdout
print(f"    http_code={code}")
try:
    d = json.loads(body)
    items = d.get("data", [])
    print(f"    success={d.get('success')}, items={len(items)}")
    for it in items[:5]:
        print(f"    - user={it.get('username')}|{it.get('displayName')}, "
              f"date={it.get('qtDate')}, title={it.get('title','')[:25]}, "
              f"photos={len(it.get('photos',[]))}, "
              f"responseId={it.get('responseId','')[:8]}")
    # 保存第一个 responseId 用于删除测试
    if items:
        with open("/tmp/test_response_id.txt", "w") as f:
            f.write(items[0]["responseId"])
        with open("/tmp/test_qt_content_id.txt", "w") as f:
            f.write(items[0]["qtContentId"])
        print(f"    [saved first responseId for delete test]")
except Exception as e:
    print(f"    parse error: {e}, body: {body[:300]}")

# 测试2: 越权删除测试（用一个假的 responseId，应返回 404 或错误，不应 500）
print()
print("=" * 50)
print("[2] DELETE /api/v1/qt/response/by-id/{fake-id} (越权/不存在测试)")
r = subprocess.run(["curl", "-s", "-w", "\n%{http_code}", "--max-time", "15",
                    "-X", "DELETE",
                    "-H", f"Authorization: Bearer {token}",
                    f"{HOST}/api/v1/qt/response/by-id/00000000-0000-0000-0000-000000000000"],
                   capture_output=True, text=True)
lines = r.stdout.rsplit("\n", 1)
code = lines[-1]
body = lines[0] if len(lines) > 1 else r.stdout
print(f"    http_code={code}")
try:
    d = json.loads(body)
    print(f"    success={d.get('success')}, message={d.get('message','')[:80]}")
except:
    print(f"    body: {body[:200]}")

print()
print("=" * 50)
print("[3] 未认证访问 all-responses (应拒绝)")
r = subprocess.run(["curl", "-s", "-w", "\n%{http_code}", "--max-time", "10",
                    f"{HOST}/api/v1/qt/all-responses"],
                   capture_output=True, text=True)
lines = r.stdout.rsplit("\n", 1)
code = lines[-1]
print(f"    http_code={code} (403/401 = 正确拒绝)")
