-- ============================================================
-- Flyway 迁移脚本 V24__fellowship_chat.sql
-- 主内通讯 (fellowship) 模块：好友、单聊、群聊、消息
-- 数据库: PostgreSQL
-- ============================================================

-- 好友关系表（合并好友请求，用 status 区分）
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,          -- 发起方
    friend_id UUID NOT NULL,        -- 接收方
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING/ACCEPTED/REJECTED
    message TEXT,                    -- 好友请求附言
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_friendship_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friendship_friend FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_friendship_user ON friendships(user_id);
CREATE INDEX idx_friendship_friend ON friendships(friend_id);
CREATE UNIQUE INDEX uk_friendship_pair ON friendships(LEAST(user_id, friend_id), GREATEST(user_id, friend_id));

-- 聊天室表
CREATE TABLE chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),               -- 群聊名称；单聊为NULL
    type VARCHAR(20) NOT NULL,       -- DIRECT(单聊) / GROUP(群聊)
    avatar_url TEXT,
    created_by UUID,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_room_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 聊天室成员表
CREATE TABLE chat_room_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL,
    user_id UUID NOT NULL,
    last_read_at TIMESTAMP,          -- 最后已读时间，用于未读计数
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_member_room FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_member_room ON chat_room_members(room_id);
CREATE INDEX idx_member_user ON chat_room_members(user_id);
CREATE UNIQUE INDEX uk_member_pair ON chat_room_members(room_id, user_id);

-- 聊天消息表
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'TEXT',  -- 预留：TEXT/IMAGE等
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_msg_room FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_msg_room_created ON chat_messages(room_id, created_at DESC);
CREATE INDEX idx_msg_sender ON chat_messages(sender_id);
