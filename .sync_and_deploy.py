#!/usr/bin/env python3
"""Sync local git commit to server, push to GitHub, SFTP upload, and deploy."""
import os
import sys
import socket
import paramiko
import subprocess

HOST = "115.159.221.62"
PORT = 22
USER = "root"
PASS = "!c7W/@8L_*6mEJXQ"
PROXY_HOST = "127.0.0.1"
PROXY_PORT = 18080
TARGET_COMMIT = "d94ddf9"
FILES = [
    "backend/src/main/java/com/bible/module/qt/service/QtOcrService.java",
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

def main():
    # 1. git bundle
    subprocess.run(["git", "bundle", "create", "/tmp/repo.bundle", "--all"], check=True, cwd="/workspace")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    sock = make_proxy_socket()
    client.connect(HOST, port=PORT, username=USER, password=PASS, sock=sock,
                   timeout=30, banner_timeout=30, auth_timeout=30)

    # 2. SFTP upload files
    sftp = client.open_sftp()
    print("Uploading changed files...")
    for f in FILES:
        local = f"/workspace/{f}"
        remote = f"/opt/bible-web/{f}"
        sftp.put(local, remote)
        print(f"  {f}")
    # 3. upload bundle
    sftp.put("/tmp/repo.bundle", "/tmp/repo.bundle")
    sftp.close()
    print("Files + bundle uploaded.")

    # 4. git fetch + reset + push
    commands = [
        f"cd /opt/bible-web && git fetch /tmp/repo.bundle 'refs/heads/*:refs/heads/local-*'",
        f"cd /opt/bible-web && git reset --hard {TARGET_COMMIT}",
        "cd /opt/bible-web && git push origin main 2>&1",
        "rm -f /tmp/repo.bundle",
    ]
    for cmd in commands:
        stdin, stdout, stderr = client.exec_command(cmd)
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        code = stdout.channel.recv_exit_status()
        print(f"$ {cmd}")
        print(out, end='')
        if err:
            print(err, end='', file=sys.stderr)
        print(f"[exit={code}]")

    # 5. Build and deploy
    print("\n=== Building and deploying ===")
    stdin, stdout, stderr = client.exec_command("cd /opt/bible-web && bash run-build.sh 2>&1", timeout=600)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    code = stdout.channel.recv_exit_status()
    print(out)
    if err:
        print(err, end='', file=sys.stderr)
    print(f"[build exit={code}]")

    client.close()
    os.remove("/tmp/repo.bundle")
    return 0

if __name__ == "__main__":
    sys.exit(main())
