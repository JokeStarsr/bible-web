#!/usr/bin/env python3
"""Deploy 拉人进群 feature: sync all changed files + rebuild backend & frontend."""
import socket
import sys
import paramiko

HOST = "115.159.221.62"
PORT = 22
USER = "root"
PASS = "!c7W/@8L_*6mEJXQ"
PROXY_HOST = "127.0.0.1"
PROXY_PORT = 18080

UPLOADS = [
    # 后端
    ("/workspace/backend/src/main/java/com/bible/module/fellowship/dto/AddMembersRequest.java",
     "/opt/bible-web/backend/src/main/java/com/bible/module/fellowship/dto/AddMembersRequest.java"),
    ("/workspace/backend/src/main/java/com/bible/module/fellowship/service/ChatService.java",
     "/opt/bible-web/backend/src/main/java/com/bible/module/fellowship/service/ChatService.java"),
    ("/workspace/backend/src/main/java/com/bible/module/fellowship/controller/ChatController.java",
     "/opt/bible-web/backend/src/main/java/com/bible/module/fellowship/controller/ChatController.java"),
    # 前端
    ("/workspace/frontend/src/services/chatApi.ts",
     "/opt/bible-web/frontend/src/services/chatApi.ts"),
    ("/workspace/frontend/src/app/fellowship/components/AddMembersModal.tsx",
     "/opt/bible-web/frontend/src/app/fellowship/components/AddMembersModal.tsx"),
    ("/workspace/frontend/src/app/fellowship/components/MembersModal.tsx",
     "/opt/bible-web/frontend/src/app/fellowship/components/MembersModal.tsx"),
    ("/workspace/frontend/src/app/fellowship/page.tsx",
     "/opt/bible-web/frontend/src/app/fellowship/page.tsx"),
    ("/workspace/frontend/src/i18n/translations.ts",
     "/opt/bible-web/frontend/src/i18n/translations.ts"),
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
    print("[1/4] Connecting via proxy...")
    sock = make_proxy_socket()
    client.connect(HOST, port=PORT, username=USER, password=PASS, sock=sock,
                   timeout=30, banner_timeout=30, auth_timeout=30)

    print("[2/4] Uploading changed files...")
    sftp = client.open_sftp()
    try:
        run(client, "mkdir -p /opt/bible-web/backend/src/main/java/com/bible/module/fellowship/dto", timeout=15)
        run(client, "mkdir -p /opt/bible-web/frontend/src/app/fellowship/components", timeout=15)
        for local, remote in UPLOADS:
            sftp.put(local, remote)
            print(f"   uploaded: {remote.split('/')[-1]}")
    finally:
        sftp.close()

    print("[3/4] Rebuilding backend + frontend containers...")
    rc, out = run(client, "cd /opt/bible-web && docker compose up -d --build backend frontend 2>&1 | tail -30", timeout=900)
    print(out)
    print(f"--- rebuild exit_code={rc} ---")

    print("[4/4] Waiting for services to be ready...")
    import time
    for i in range(40):
        time.sleep(2)
        rc1, out1 = run(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/api/v1/qt/today", timeout=10)
        rc2, out2 = run(client, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/fellowship", timeout=10)
        be = out1.strip()
        fe = out2.strip()
        print(f"   attempt {i+1}: backend={be}  frontend=/fellowship={fe}")
        if be in ("200", "403") and fe == "200":
            break

    print("\n=== container status ===")
    rc, out = run(client, "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.CreatedAt}}' | grep -E 'bible|NAMES'")
    print(out)

    client.close()
    sys.exit(0 if rc == 0 else 1)


if __name__ == "__main__":
    main()
