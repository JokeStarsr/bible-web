#!/usr/bin/env python3
"""Deploy frontend qt-admin page + translations, rebuild container."""
import socket
import hashlib

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


def run(client, cmd, timeout=600):
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

    # 1. 上传前端文件
    print("=== 1. upload frontend files ===")
    sftp = client.open_sftp()
    try:
        sftp.put("/workspace/frontend/src/app/qt-admin/page.tsx",
                 "/opt/bible-web/frontend/src/app/qt-admin/page.tsx")
        print("   qt-admin/page.tsx uploaded")
        sftp.put("/workspace/frontend/src/i18n/translations.ts",
                 "/opt/bible-web/frontend/src/i18n/translations.ts")
        print("   i18n/translations.ts uploaded")
    finally:
        sftp.close()

    # 2. 校验 md5
    print("\n=== 2. verify md5 ===")
    rc, srv_md5 = run(client, "md5sum /opt/bible-web/frontend/src/app/qt-admin/page.tsx | awk '{print $1}'")
    srv_md5 = srv_md5.strip()
    local_data = open("/workspace/frontend/src/app/qt-admin/page.tsx", "rb").read()
    local_md5 = hashlib.md5(local_data).hexdigest()
    print(f"page.tsx  server={srv_md5}  local={local_md5}  {'MATCH' if srv_md5 == local_md5 else 'DIFFERS'}")

    rc, srv_md5 = run(client, "md5sum /opt/bible-web/frontend/src/i18n/translations.ts | awk '{print $1}'")
    srv_md5 = srv_md5.strip()
    local_data = open("/workspace/frontend/src/i18n/translations.ts", "rb").read()
    local_md5 = hashlib.md5(local_data).hexdigest()
    print(f"translations.ts  server={srv_md5}  local={local_md5}  {'MATCH' if srv_md5 == local_md5 else 'DIFFERS'}")

    # 3. 重建前端容器（优先 docker compose，回退 docker-compose）
    print("\n=== 3. rebuild frontend container ===")
    rc, out = run(client,
                 "cd /opt/bible-web && (docker compose up -d --build frontend 2>&1 || docker-compose up -d --build frontend 2>&1) | tail -40",
                 timeout=900)
    print(out)

    # 4. 等待启动 + 健康检查
    print("\n=== 4. wait for frontend to be ready ===")
    import time
    for i in range(30):
        time.sleep(2)
        rc, out = run(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/qt-admin")
        code = out.strip()
        print(f"   attempt {i+1}: http_code={code}")
        if code == "200":
            break

    # 5. 最终验证
    print("\n=== 5. final verification ===")
    rc, out = run(client, "docker inspect -f '{{.Created}}' bible-frontend 2>/dev/null")
    print("container created:", out.strip())
    rc, out = run(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/qt-admin")
    print("qt-admin http_code:", out.strip())

    client.close()


if __name__ == "__main__":
    main()
