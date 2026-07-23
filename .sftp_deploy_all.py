#!/usr/bin/env python3
"""Upload all changed/new tracked files to remote server via SFTP through HTTP proxy."""
import os
import socket
import subprocess
import paramiko

HOST = "115.159.221.62"
PORT = 22
USER = "root"
PASS = "!c7W/@8L_*6mEJXQ"
PROXY_HOST = "127.0.0.1"
PROXY_PORT = 18080
REMOTE_BASE = "/opt/bible-web"
LOCAL_BASE = "/workspace"

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

def get_changed_files():
    """Return list of (local_path, remote_path) for changed/new tracked files."""
    result = subprocess.run(
        ["git", "diff", "--name-only", "--diff-filter=AM", "HEAD~1", "HEAD"],
        cwd=LOCAL_BASE,
        capture_output=True,
        text=True,
        check=True,
    )
    files = []
    for name in result.stdout.strip().splitlines():
        local = os.path.join(LOCAL_BASE, name)
        remote = os.path.join(REMOTE_BASE, name).replace("\\", "/")
        files.append((local, remote))
    return files

def main():
    files = get_changed_files()
    if not files:
        print("No changed files to upload.")
        return

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    sock = make_proxy_socket()
    client.connect(HOST, port=PORT, username=USER, password=PASS, sock=sock,
                   timeout=30, banner_timeout=30, auth_timeout=30)
    sftp = client.open_sftp()
    try:
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
            print(f"Uploaded {local} -> {remote}")
    finally:
        sftp.close()
        client.close()

if __name__ == "__main__":
    main()
