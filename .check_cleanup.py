#!/usr/bin/env python3
"""Check image cleanup status on remote server."""
import socket
import paramiko

HOST = "115.159.221.62"
PORT = 22
USER = "root"
PASS = "!c7W/@8L_*6mEJXQ"
PROXY_HOST = "127.0.0.1"
PROXY_PORT = 18080


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


def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    sock = make_proxy_socket()
    client.connect(HOST, port=PORT, username=USER, password=PASS, sock=sock,
                   timeout=30, banner_timeout=30, auth_timeout=30)

    commands = [
        # 1. backend container /tmp - check for qt-ocr-* residue
        "docker exec bible-backend sh -c 'ls -la /tmp/qt-ocr-* 2>/dev/null; echo \"---\"; ls /tmp 2>/dev/null' 2>&1",
        # 2. backend container tomcat work dir (multipart tmp)
        "docker exec bible-backend sh -c 'find /tmp/tomcat* -type f 2>/dev/null; ls -la /tmp/tomcat* 2>/dev/null' 2>&1",
        # 3. nginx client_temp buffer
        "docker exec bible-nginx sh -c 'ls -la /var/cache/nginx/client_temp/ 2>/dev/null' 2>&1",
        # 4. uploads/qt-photos (user response photos, persistent)
        "ls -la /opt/bible-web/uploads/qt-photos 2>/dev/null; du -sh /opt/bible-web/uploads 2>/dev/null",
        # 5. disk usage of /opt and /tmp
        "df -h /opt /tmp 2>/dev/null",
        # 6. all qt-ocr temp files on host
        "find / -name 'qt-ocr-*' -type f 2>/dev/null",
    ]
    for cmd in commands:
        print(f"\n=== $ {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, timeout=60)
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        code = stdout.channel.recv_exit_status()
        print(out)
        if err.strip():
            print(f"[stderr] {err}")
        print(f"[exit={code}]")

    client.close()


if __name__ == "__main__":
    main()
