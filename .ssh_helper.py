#!/usr/bin/env python3
import sys
import socket
import paramiko

HOST = '115.159.221.62'
PORT = 22
USER = 'root'
PASS = '!c7W/@8L_*6mEJXQ'
PROXY = ('127.0.0.1', 18080)

def connect_proxy():
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.connect(PROXY)
    connect_req = f"CONNECT {HOST}:{PORT} HTTP/1.1\r\nHost: {HOST}:{PORT}\r\n\r\n".encode()
    sock.sendall(connect_req)
    resp = sock.recv(4096)
    if b'200' not in resp:
        raise Exception(f"Proxy CONNECT failed: {resp[:200]}")
    return sock

def run_command(command):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    sock = connect_proxy()
    client.connect(HOST, port=PORT, username=USER, password=PASS, sock=sock, timeout=30)
    stdin, stdout, stderr = client.exec_command(command, get_pty=True)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    code = stdout.channel.recv_exit_status()
    client.close()
    return code, out, err

if __name__ == '__main__':
    cmd = ' '.join(sys.argv[1:])
    code, out, err = run_command(cmd)
    print(out, end='')
    if err:
        print(err, end='', file=sys.stderr)
    sys.exit(code)
