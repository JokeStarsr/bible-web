#!/usr/bin/env python3
"""Upload files to remote server via SFTP through HTTP proxy."""
import sys
import os
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
    files = [
        ("/workspace/backend/src/main/java/com/bible/module/auth/service/AuthService.java",
         "/opt/bible-web/backend/src/main/java/com/bible/module/auth/service/AuthService.java"),
        ("/workspace/backend/src/main/resources/db/migration/V3__seed_data.sql",
         "/opt/bible-web/backend/src/main/resources/db/migration/V3__seed_data.sql"),
        ("/workspace/frontend/src/app/layout.tsx",
         "/opt/bible-web/frontend/src/app/layout.tsx"),
        ("/workspace/frontend/src/app/login/page.tsx",
         "/opt/bible-web/frontend/src/app/login/page.tsx"),
        ("/workspace/frontend/src/components/NavBar.tsx",
         "/opt/bible-web/frontend/src/components/NavBar.tsx"),
    ]
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    sock = make_proxy_socket()
    client.connect(HOST, port=PORT, username=USER, password=PASS, sock=sock,
                   timeout=30, banner_timeout=30, auth_timeout=30)
    sftp = client.open_sftp()
    for local, remote in files:
        rdir = os.path.dirname(remote)
        parts = rdir.split("/")
        path = ""
        for p in parts:
            if not p:
                continue
            path += "/" + p
            try:
                sftp.stat(path)
            except FileNotFoundError:
                sftp.mkdir(path)
        sftp.put(local, remote)
        print(f"Uploaded {os.path.basename(local)} -> {remote}")
    sftp.close()
    client.close()

if __name__ == "__main__":
    main()
