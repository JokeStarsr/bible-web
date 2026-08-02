#!/usr/bin/env python3
"""部署前端并验证 AddFriendModal 修复。"""
import socket
import paramiko
import time
import sys

HOST = "115.159.221.62"
PORT = 22
ADMIN = "852341467@qq.com"
TARGET_EMAIL = "yeham_kwok@163.com"


def sock():
    s = socket.socket()
    s.settimeout(30)
    s.connect(("127.0.0.1", 18080))
    s.sendall(f"CONNECT {HOST}:{PORT} HTTP/1.1\r\nHost: {HOST}:{PORT}\r\n\r\n".encode())
    assert b"200" in s.recv(4096).split(b"\r\n")[0]
    return s


def main():
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(HOST, PORT, "root", "!c7W/@8L_*6mEJXQ", sock=sock(), timeout=30)

    def run(cmd, t=600):
        _, o, _ = c.exec_command(cmd, get_pty=True, timeout=t)
        return o.channel.recv_exit_status(), o.read().decode("utf-8", "replace")

    # 1. 上传修改文件
    print("=== 1. upload AddFriendModal.tsx ===")
    sftp = c.open_sftp()
    sftp.put(
        "/workspace/frontend/src/app/fellowship/components/AddFriendModal.tsx",
        "/opt/bible-web/frontend/src/app/fellowship/components/AddFriendModal.tsx",
    )
    sftp.close()
    print("   uploaded")

    # 2. 重建前端
    print("=== 2. rebuild frontend ===")
    rc, out = run("cd /opt/bible-web && docker compose up -d --build frontend 2>&1 | tail -6", 600)
    print(out)
    print("exit=", rc)

    # 3. 等待就绪
    print("=== 3. wait ready ===")
    for i in range(20):
        time.sleep(2)
        _, out = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/fellowship", 10)
        code = out.strip()
        print(f"  {i+1}: {code}")
        if code in ("200", "307"):
            print("  ready")
            break

    _, out = run("docker ps --format '{{.Names}} {{.Status}}' | grep bible-frontend")
    print("container:", out.strip())

    c.close()
    sys.exit(0 if rc == 0 else 1)


if __name__ == "__main__":
    main()
