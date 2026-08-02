#!/usr/bin/env python3
"""Deploy backend parser: upload 3 backend files + rebuild backend container."""
import socket
import sys
import paramiko

HOST = "115.159.221.62"
PORT = 22
USER = "root"
PASS = "!c7W/@8L_*6mEJXQ"
PROXY_HOST = "127.0.0.1"
PROXY_PORT = 18080

BASE = "/opt/bible-web/backend/src/main"
UPLOADS = [
    ("/workspace/backend/src/main/java/com/bible/module/qt/service/QtFormatParser.java",
     f"{BASE}/java/com/bible/module/qt/service/QtFormatParser.java"),
    ("/workspace/backend/src/main/java/com/bible/module/qt/controller/QtController.java",
     f"{BASE}/java/com/bible/module/qt/controller/QtController.java"),
    ("/workspace/backend/src/test/java/com/bible/module/qt/service/QtFormatParserTest.java",
     "/opt/bible-web/backend/src/test/java/com/bible/module/qt/service/QtFormatParserTest.java"),
]


def make_proxy_socket():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(30)
    s.connect((PROXY_HOST, PROXY_PORT))
    req = f"CONNECT {HOST}:{PORT} HTTP/1.1\r\nHost: {HOST}:{PORT}\r\n\r\n".encode()
    s.sendall(req)
    data = s.recv(4096)
    if b"200" not in data.split(b"\r\n")[0]:
        raise RuntimeError(f"Proxy CONNECT failed: {data[:200]!r}")
    return s


def run(client, cmd, timeout=900):
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True, timeout=timeout)
    rc = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace")
    return rc, out


def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print("[1/3] Connecting via proxy...")
    sock = make_proxy_socket()
    client.connect(HOST, port=PORT, username=USER, password=PASS, sock=sock,
                   timeout=30, banner_timeout=30, auth_timeout=30)

    print("[2/3] Uploading backend files...")
    # 先确保测试目录存在
    run(client, "mkdir -p /opt/bible-web/backend/src/test/java/com/bible/module/qt/service", timeout=30)
    sftp = client.open_sftp()
    try:
        for local, remote in UPLOADS:
            sftp.put(local, remote)
            st = sftp.stat(remote)
            print(f"   {remote.split('/')[-1]} -> {st.st_size} bytes")
    finally:
        sftp.close()

    print("[3/3] Rebuilding backend (docker compose up -d --build backend)...")
    rc, out = run(client, "cd /opt/bible-web && docker compose up -d --build backend 2>&1")
    print("--- REBUILD OUTPUT (tail 60) ---")
    print("\n".join(out.splitlines()[-60:]))
    print(f"--- exit_code={rc} ---")

    client.close()
    sys.exit(0 if rc == 0 else 1)


if __name__ == "__main__":
    main()
