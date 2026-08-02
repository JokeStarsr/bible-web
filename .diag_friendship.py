#!/usr/bin/env python3
"""排查 yeham_kwok@163.com 好友关系数据不一致问题。"""
import socket
import paramiko

HOST = "115.159.221.62"
PORT = 22
ADMIN = "852341467@qq.com"
TARGET = "yeham_kwook@163.com"
TARGET2 = "yeham_kwok@163.com"


def sock():
    s = socket.socket()
    s.settimeout(30)
    s.connect(("127.0.0.1", 18080))
    s.sendall(f"CONNECT {HOST}:{PORT} HTTP/1.1\r\nHost: {HOST}:{PORT}\r\n\r\n".encode())
    assert b"200" in s.recv(4096).split(b"\r\n")[0]
    return s


def main():
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(HOST, PORT, "root", "!c7W/@8L_*6mEJXQ", sock=sock(), timeout=30)

    def run(sql):
        cmd = f"docker exec bible-postgres psql -U bible_user -d bible -c \"{sql}\""
        _, o, _ = c.exec_command(cmd, get_pty=True, timeout=30)
        return o.read().decode("utf-8", "replace")

    def run_scalar(sql):
        cmd = f"docker exec bible-postgres psql -U bible_user -d bible -t -A -c \"{sql}\""
        _, o, _ = c.exec_command(cmd, get_pty=True, timeout=30)
        return o.read().decode("utf-8", "replace").strip()

    # 1. 用户信息（两种邮箱拼写都查）
    print("=== 1. 用户信息 ===")
    print(run(f"SELECT id,username,email,display_name,status,deleted_at FROM users WHERE email IN ('{TARGET}','{TARGET2}') ORDER BY created_at;"))

    yeham_id = run_scalar(f"SELECT id FROM users WHERE email='{TARGET2}';")
    admin_id = run_scalar(f"SELECT id FROM users WHERE email='{ADMIN}';")
    print(f"\nadmin_id={admin_id}")
    print(f"yeham_id={yeham_id}")

    # 2. 双向好友记录
    print("\n=== 2. 双向好友记录（friendships）===")
    print(run(f"SELECT id,user_id,friend_id,status,created_at FROM friendships WHERE (user_id='{admin_id}' AND friend_id='{yeham_id}') OR (user_id='{yeham_id}' AND friend_id='{admin_id}');"))

    # 3. admin 视角 findFriends 返回（ACCEPTED 且 user_id=admin）
    print("\n=== 3. admin 作为 user_id 的 ACCEPTED 好友 ===")
    print(run(f"SELECT f.id, f.user_id, f.friend_id, f.status, u.username, u.email FROM friendships f JOIN users u ON u.id=f.friend_id WHERE f.user_id='{admin_id}' AND f.status='ACCEPTED';"))

    # 4. 反向：yeham 作为 user_id 的记录
    print("\n=== 4. yeham 作为 user_id 的好友记录 ===")
    print(run(f"SELECT f.id, f.user_id, f.friend_id, f.status, u.username, u.email FROM friendships f JOIN users u ON u.id=f.friend_id WHERE f.user_id='{yeham_id}';"))

    # 5. 是否在同一直接房间
    print("\n=== 5. 两人共有的 DIRECT 房间 ===")
    print(run(f"SELECT r.id, r.type FROM chat_rooms r WHERE r.type='DIRECT' AND r.id IN (SELECT room_id FROM chat_room_members WHERE user_id='{admin_id}' INTERSECT SELECT room_id FROM chat_room_members WHERE user_id='{yeham_id}');"))

    c.close()


if __name__ == "__main__":
    main()
