#!/usr/bin/env python3
"""Check server maven env + run QtFormatParserTest directly."""
import socket
import sys
import paramiko

HOST = "115.159.221.62"
PORT = 22
USER = "root"
PASS = "!c7W/@8L_*6mEJXQ"


def make_proxy_socket():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(30)
    s.connect(("127.0.0.1", 18080))
    req = f"CONNECT {HOST}:{PORT} HTTP/1.1\r\nHost: {HOST}:{PORT}\r\n\r\n".encode()
    s.sendall(req)
    data = s.recv(4096)
    assert b"200" in data.split(b"\r\n")[0], data[:80]
    return s


def run(client, cmd, timeout=600):
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True, timeout=timeout)
    rc = stdout.channel.recv_exit_status()
    out = stdout.read().decode("utf-8", errors="replace")
    return rc, out


def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    sock = make_proxy_socket()
    client.connect(HOST, port=PORT, username=USER, password=PASS, sock=sock, timeout=30)

    # 1. 上传最新 parser + test 文件
    print("=== upload parser + test files ===")
    sftp = client.open_sftp()
    try:
        sftp.put("/workspace/backend/src/main/java/com/bible/module/qt/service/QtFormatParser.java",
                 "/opt/bible-web/backend/src/main/java/com/bible/module/qt/service/QtFormatParser.java")
        print("   parser uploaded")
        sftp.put("/workspace/backend/src/test/java/com/bible/module/qt/service/QtFormatParserTest.java",
                 "/opt/bible-web/backend/src/test/java/com/bible/module/qt/service/QtFormatParserTest.java")
        print("   test uploaded")
    finally:
        sftp.close()

    # 2. 离线跑测试（依赖已缓存）
    print("=== mvn test offline ===")
    cmd = ("cd /opt/bible-web/backend && "
           "docker run --rm -v $PWD:/app -v $HOME/.m2:/root/.m2 -w /app maven:3.9-eclipse-temurin-17 "
           "mvn -o test -Dtest=QtFormatParserTest -DfailIfNoTests=false 2>&1 | tail -80")
    rc, out = run(client, cmd, timeout=600)
    print("--- TEST OUTPUT (tail) ---")
    print(out[-3000:] if len(out) > 3000 else out)
    print(f"--- exit_code={rc} ---")

    # 读取 surefire-reports 完整 stdout（含 System.out 诊断）
    print("=== SUREFIRE STDOUT (diagnostic markers) ===")
    rc2, out2 = run(client,
        "grep -E 'VERSE_|BLOCK\\[|COMMENTARY_|SCRIPTURE_TEXT' /opt/bible-web/backend/target/surefire-reports/com.bible.module.qt.service.QtFormatParserTest-output.txt 2>/dev/null | head -60",
        timeout=30)
    print(out2)
    client.close()


if __name__ == "__main__":
    main()
