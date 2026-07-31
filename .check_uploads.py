#!/usr/bin/env python3
"""Check recently uploaded files on the remote server."""
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

    # Check common upload/temp directories and recently modified image files
    commands = [
        # Recently modified image files anywhere reasonable
        "find /opt/bible-web /tmp /root /home -type f \\( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.webp' -o -iname '*.heic' \\) -mmin -120 2>/dev/null",
        # Spring multipart tmp
        "ls -lat /tmp 2>/dev/null | head -30",
        # backend container tmp uploads
        "docker exec bible-backend sh -c 'ls -lat /tmp 2>/dev/null | head -30' 2>&1",
        # backend working dir
        "docker exec bible-backend sh -c 'find /tmp /app -type f \\( -iname \"*.png\" -o -iname \"*.jpg\" -o -iname \"*.jpeg\" \\) -mmin -120 2>/dev/null' 2>&1",
        # uploads qt-photos dir
        "ls -lat /opt/bible-web/uploads/qt-photos 2>/dev/null | head -20",
        # backend recent logs (last 80 lines) for OCR/upload activity
        "docker logs --tail 80 bible-backend 2>&1 | grep -iE 'upload|ocr|photo|multipart|image' | tail -30",
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
