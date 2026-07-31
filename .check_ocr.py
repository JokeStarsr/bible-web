#!/usr/bin/env python3
"""Diagnose OCR feature on remote server."""
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
        # 1. backend full recent logs (200 lines)
        "docker logs --tail 200 bible-backend 2>&1 | tail -200",
        # 2. grep OCR / vision / llm related logs
        "docker logs --tail 500 bible-backend 2>&1 | grep -iE 'ocr|vision|llm|大模型|recognize|image|multipart|admin/ocr' | tail -40",
        # 3. check llm config (env vars)
        "docker exec bible-backend sh -c 'env | grep -iE \"llm|api|key|vision\" | sed \"s/=.\\{8\\}/=*****/\"' 2>&1",
        # 4. check application-prod.yml for llm config (mask keys)
        "cat /opt/bible-web/backend/src/main/resources/application-prod.yml 2>/dev/null | grep -iE 'llm|api|key|vision|base-url|model|enabled' | sed 's/\\(key\\|password\\): .*/\\1: *****/'",
        # 5. backend container status
        "docker ps --filter name=bible-backend --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}'",
        # 6. test connectivity to common LLM API endpoints from backend container
        "docker exec bible-backend sh -c 'wget -q -O- --timeout=8 https://api.openai.com 2>&1 | head -3; echo \"---openai exit=$?\"' 2>&1",
        # 7. check recent qt-photos uploads again (last 30 min)
        "find /opt/bible-web/uploads -type f -mmin -60 2>/dev/null; ls -lat /opt/bible-web/uploads/qt-photos 2>/dev/null | head -10",
        # 8. check nginx access log for /api/qt/admin/ocr requests
        "docker logs --tail 100 bible-nginx 2>&1 | grep -iE 'ocr|admin' | tail -20",
        # 9. backend health
        "curl -s -o /dev/null -w 'backend HTTP=%{http_code} time=%{time_total}s\\n' http://localhost:8080/api/health 2>&1",
        # 10. memory/cpu of backend
        "docker stats --no-stream --format 'table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}' bible-backend bible-frontend",
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
