#!/usr/bin/env python3
"""Deploy NavBar.tsx + rebuild frontend only."""
import socket
import sys
import paramiko

HOST = "115.159.221.62"
PORT = 22
USER = "root"
PASS = "!c7W/@8L_*6mEJXQ"


def make_proxy_socket():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(30)
    s.connect(("127.0.0.1", 18080))
    req = f"CONNECT {HOST}:{PORT} HTTP/1.1\r\nHost: {HOST}:{PORT}\r\n\r\n".encode()
    s.sendall(req)
    data = s.recv(4096)
    if b"200" not in data.split(b"\r\n")[0]:
        raise RuntimeError(f"Proxy CONNECT failed: {data[:200]!r}")
    return s


def run(client, cmd, timeout=600):
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True, timeout=timeout)
    rc = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace")
    return rc, out


def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    sock = make_proxy_socket()
    client.connect(HOST, port=PORT, username=USER, password=PASS, sock=sock, timeout=30)

    print("[1/3] Upload NavBar.tsx...")
    sftp = client.open_sftp()
    try:
        sftp.put("/workspace/frontend/src/components/NavBar.tsx",
                 "/opt/bible-web/frontend/src/components/NavBar.tsx")
        print("   uploaded")
    finally:
        sftp.close()

    # 校验 /fellowship 已移除
    rc, out = run(client, "grep -c 'href=\"/fellowship\"' /opt/bible-web/frontend/src/components/NavBar.tsx || true")
    print(f"   /fellowship 链接数={out.strip()} (期望 0)")

    print("[2/3] Rebuild frontend...")
    rc, out = run(client, "cd /opt/bible-web && docker compose up -d --build frontend 2>&1 | tail -15", timeout=600)
    print(out)
    print(f"--- exit={rc} ---")

    print("[3/3] Wait for frontend ready...")
    import time
    for i in range(30):
        time.sleep(2)
        rc, out = run(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/", timeout=10)
        c = out.strip()
        print(f"   attempt {i+1}: {c}")
        if c == "200":
            break

    client.close()
    sys.exit(0 if rc == 0 else 1)


if __name__ == "__main__":
    main()
