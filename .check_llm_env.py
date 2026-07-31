#!/usr/bin/env python3
"""Check current LLM/env config on server and test connectivity."""
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

    cmds = [
        # 1. check .env file on server (mask secrets)
        "cat /opt/bible-web/.env 2>/dev/null | sed -E 's/(KEY|PASS|SECRET)=.{6}.*/\\1=*****/'",
        # 2. current backend env (full LLM related)
        "docker exec bible-backend sh -c 'env | grep -iE \"^LLM\" | sort'",
        # 3. test deepseek API reachability from backend
        "docker exec bible-backend sh -c 'wget -q -O- --timeout=8 https://api.deepseek.com 2>&1 | head -3; echo \"exit=$?\"' 2>&1",
        # 4. test volcengine (doubao) API reachability
        "docker exec bible-backend sh -c 'wget -q -O- --timeout=8 https://ark.cn-beijing.volces.com 2>&1 | head -3; echo \"exit=$?\"' 2>&1",
        # 5. test openai reachability
        "docker exec bible-backend sh -c 'wget -q -O- --timeout=8 https://api.openai.com 2>&1 | head -3; echo \"exit=$?\"' 2>&1",
        # 6. test qwen (aliyun dashscope) reachability
        "docker exec bible-backend sh -c 'wget -q -O- --timeout=8 https://dashscope.aliyuncs.com 2>&1 | head -3; echo \"exit=$?\"' 2>&1",
    ]
    for cmd in cmds:
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
