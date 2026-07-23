import sys
import paramiko

host = "115.159.221.62"
port = 22
user = "root"
with open("/workspace/.server_pass", "r") as f:
    password = f.read().strip()

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
try:
    client.connect(host, port=port, username=user, password=password, timeout=20, banner_timeout=20)
except Exception as e:
    print(f"SSH 连接失败: {e}", file=sys.stderr)
    sys.exit(1)

def run(cmd, check=True):
    print(f"\n>>> {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode("utf-8", errors="replace")
    err = stderr.read().decode("utf-8", errors="replace")
    rc = stdout.channel.recv_exit_status()
    if out:
        print(out)
    if err:
        print(err, file=sys.stderr)
    print(f"<<< exit code: {rc}")
    if check and rc != 0:
        sys.exit(rc)
    return out, err, rc

# 查找项目路径
out, _, _ = run("find / -maxdepth 5 -name 'docker-compose.yml' 2>/dev/null | grep -E 'bible|bible-web' | head -5", check=False)
paths = [p.strip() for p in out.splitlines() if p.strip()]
if not paths:
    print("未找到 bible-web 的 docker-compose.yml", file=sys.stderr)
    sys.exit(1)
compose_path = paths[0]
project_dir = compose_path.rsplit("/", 1)[0]
print(f"\n项目目录: {project_dir}")

# 检测 docker compose 命令
compose_cmd = "docker compose"
_, _, rc = run("docker compose version", check=False)
if rc != 0:
    _, _, rc = run("docker-compose --version", check=False)
    if rc == 0:
        compose_cmd = "docker-compose"
    else:
        print("服务器未安装 docker compose", file=sys.stderr)
        sys.exit(1)

run(f"cd {project_dir} && git pull origin main")
run(f"cd {project_dir} && {compose_cmd} up -d --build")
run(f"cd {project_dir} && {compose_cmd} restart backend")

# 简单查看后端日志最后 30 行
run(f"cd {project_dir} && {compose_cmd} logs --tail=30 backend", check=False)

client.close()
