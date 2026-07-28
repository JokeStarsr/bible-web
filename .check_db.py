#!/usr/bin/env python3
"""检查数据库表大小和服务器磁盘空间"""
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

def run(client, cmd, timeout=30):
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    return stdout.read().decode(errors="replace"), stderr.read().decode(errors="replace")

def main():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    sock = make_proxy_socket()
    client.connect(HOST, port=PORT, username=USER, password=PASS, sock=sock,
                   timeout=30, banner_timeout=30, auth_timeout=30)

    DC = "cd /opt/bible-web && docker compose"
    PSQL = f"{DC} exec -T postgres psql -U bible_user -d bible"

    print("=" * 60)
    print("1. 服务器磁盘空间")
    print("=" * 60)
    out, _ = run(client, "df -h / /var/lib/docker 2>/dev/null || df -h /")
    print(out)

    print("=" * 60)
    print("2. 数据库总大小")
    print("=" * 60)
    out, _ = run(client, f'''{PSQL} -c "SELECT pg_size_pretty(pg_database_size('bible')) AS db_size;"''')
    print(out)

    print("=" * 60)
    print("3. 各表大小（按总大小排序）")
    print("=" * 60)
    out, _ = run(client, f'''{PSQL} -c "
SELECT
    schemaname||'.'||tablename AS table_name,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS data_size,
    reltuples::bigint AS approx_rows
FROM pg_tables
WHERE schemaname='public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"''')
    print(out)

    print("=" * 60)
    print("4. qt_daily_contents 表详情")
    print("=" * 60)
    out, _ = run(client, f'''{PSQL} -c "
SELECT
    count(*) AS total_rows,
    count(title) AS title_count,
    count(scripture_reference) AS ref_count,
    count(scripture_text) AS text_count,
    count(scripture_text_ko) AS text_ko_count,
    count(commentary_ko) AS commentary_ko_count,
    count(hymn_ko) AS hymn_ko_count,
    pg_size_pretty(pg_total_relation_size('qt_daily_contents')) AS table_size,
    pg_size_pretty(sum(octet_length(title || scripture_reference || scripture_text || commentary || hymn || COALESCE(scripture_text_ko,'') || COALESCE(commentary_ko,'') || COALESCE(hymn_ko,'')))) AS text_data_size
FROM qt_daily_contents;"''')
    print(out)

    print("=" * 60)
    print("5. qt_daily_contents 各字段平均长度")
    print("=" * 60)
    out, _ = run(client, f'''{PSQL} -c "
SELECT
    round(avg(octet_length(title))) AS avg_title,
    round(avg(octet_length(scripture_reference))) AS avg_ref,
    round(avg(octet_length(scripture_text))) AS avg_text,
    round(avg(octet_length(commentary))) AS avg_commentary,
    round(avg(octet_length(hymn))) AS avg_hymn,
    round(avg(octet_length(scripture_text_ko))) AS avg_text_ko,
    round(avg(octet_length(commentary_ko))) AS avg_commentary_ko,
    round(avg(octet_length(hymn_ko))) AS avg_hymn_ko
FROM qt_daily_contents;"''')
    print(out)

    print("=" * 60)
    print("6. Docker 磁盘占用")
    print("=" * 60)
    out, _ = run(client, "docker system df 2>/dev/null")
    print(out)

    print("=" * 60)
    print("7. 内存使用")
    print("=" * 60)
    out, _ = run(client, "free -h")
    print(out)

    client.close()

if __name__ == "__main__":
    main()
