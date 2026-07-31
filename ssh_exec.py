#!/usr/bin/env python3
"""SSH 命令执行封装：python3 ssh_exec.py '<远程命令>'"""
import sys
import paramiko

HOST = "115.159.221.62"
USER = "root"
PASS = "!c7W/@8L_*6mEJXQ"

def run(cmd, timeout=60):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    try:
        client.connect(HOST, username=USER, password=PASS, timeout=15, allow_agent=False, look_for_keys=False)
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
