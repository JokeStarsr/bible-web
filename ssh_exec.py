#!/usr/bin/env python3
"""SSH 命令执行封装（走本地HTTP代理隧道）：python3 ssh_exec.py '<远程命令>'"""
import sys
import socket
import paramiko

HOST = "115.159.221.62"
USER = "root"
PASS = "!c7W/@8L_*6mEJXQ"
PROXY_HOST = "127.0.0.1"
PROXY_PORT = 18080

def make_proxy_sock():
    """通过 HTTP 代理建立 CONNECT 隧道到目标主机的 22 端口"""
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(15)
    s.connect((PROXY_HOST, PROXY_PORT))
    req = f"CONNECT {HOST}:22 HTTP/1.1\r\nHost: {HOST}:22\r\n\r\n"
    s.sendall(req.encode())
    data = b""
    while b"\r\n\r\n" not in data:
        chunk = s.recv(4096)
        if not chunk:
            raise RuntimeError("代理未返回响应")
        data += chunk
    if b" 200 " not in data.split(b"\r\n")[0]:
        raise RuntimeError("代理拒绝CONNECT: " + data.decode("utf-8", errors="replace")[:200])
    return s

def run(cmd, timeout=300):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    sock = make_proxy_sock()
    try:
        client.connect(HOST, username=USER, password=PASS, timeout=20,
                       allow_agent=False, look_for_keys=False, sock=sock)
        stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout, get_pty=False)
        out = stdout.read().decode("utf-8", errors="replace")
        err = stderr.read().decode("utf-8", errors="replace")
        code = stdout.channel.recv_exit_status()
        if out:
            print(out, end="" if out.endswith("\n") else "\n")
        if err:
            print("=== STDERR ===", file=sys.stderr)
            print(err, end="" if err.endswith("\n") else "\n", file=sys.stderr)
        print(f"=== exit: {code} ===", file=sys.stderr)
        return code
    finally:
        client.close()

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "echo hi"
    sys.exit(run(cmd))
