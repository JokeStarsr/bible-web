#!/usr/bin/env python3
"""Test Doubao vision model API directly from server backend container."""
import socket
import paramiko

HOST = "115.159.221.62"
PORT = 22
USER = "root"
PASS = "!c7W/@8L_*6mEJXQ"
PROXY_HOST = "127.0.0.1"
PROXY_PORT = 18080

API_KEY = "VxCgNvLTE.ChBSWVRlOWVxbVhEdWlBTTlOEObvjewHGAEqEHA547nGwk32l5Oo2_jSJw8.8UqGrvL63WTmp-uY6fKt7w4Tk-dYNkCOTNgt6LuICPw1GMP70DC4WR-M0j1jmYBZVDyjLxys14iYmIBzqzUPAweZ"

# Test multiple candidate model names; pick the first that works
CANDIDATE_MODELS = [
    "doubao-1.5-vision-pro-32k",
    "doubao-vision-pro-32k",
    "doubao-1.5-vision-pro-32k-250115",
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
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    sock = make_proxy_socket()
    client.connect(HOST, port=PORT, username=USER, password=PASS, sock=sock,
                   timeout=30, banner_timeout=30, auth_timeout=30)

    # Test each candidate model with a minimal text-only request first (cheaper/faster)
    for model in CANDIDATE_MODELS:
        print(f"\n=== Testing model: {model} ===")
        # Use ark.cn-beijing.volces.com endpoint (OpenAI-compatible)
        cmd = f"""curl -s -X POST 'https://ark.cn-beijing.volces.com/api/v3/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer {API_KEY}' \
  --max-time 20 \
  -d '{{"model":"{model}","messages":[{{"role":"user","content":"说OK"}}],"max_tokens":10}}' 2>&1"""
        stdin, stdout, stderr = client.exec_command(cmd, timeout=40)
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        print(out[:800])
        if err.strip():
            print(f"[stderr] {err[:300]}")
        # Check if success
        if '"content"' in out and ('"OK"' in out or 'OK' in out):
            print(f">>> SUCCESS with {model}")
            break
        elif '"error"' in out or '"code"' in out:
            print(f">>> FAILED with {model}, trying next")

    client.close()


if __name__ == "__main__":
    main()
