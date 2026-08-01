-- ============================================================
-- Flyway 迁移脚本 V25__courtship.sql
-- 主内佳偶 (courtship) 模块：单身交友资料、心动意向、互相匹配、见证、举报
-- 数据库: PostgreSQL
-- ============================================================

-- 1. 交友资料表（每个用户一份）
CREATE TABLE courtship_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,            -- 关联用户
    nickname VARCHAR(50) NOT NULL,            -- 展示昵称
    gender VARCHAR(10) NOT NULL,             -- MALE/FEMALE
    birth_date DATE,                          -- 生日（用于推算年龄）
    region VARCHAR(100),                      -- 所在地区
    occupation VARCHAR(100),                  -- 职业
    bio TEXT,                                 -- 自我介绍
    -- 信仰背景
    belief_years INT,                         -- 信主年限
    church_name VARCHAR(150),                 -- 聚会教会名称
    ministry_role VARCHAR(100),               -- 服侍岗位
    -- 交友意向
    seeking_gender VARCHAR(10),               -- 期望对方性别 MALE/FEMALE
    seeking_age_min INT,                      -- 期望年龄下限
    seeking_age_max INT,                      -- 期望年龄上限
    seeking_region VARCHAR(100),              -- 期望地区
    -- 媒体
    photos VARCHAR(2000),                      -- 照片 URL（逗号分隔字符串，最多 6 张）
    -- 审核状态
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING(待审核)/APPROVED(已通过)/REJECTED(已驳回)/HIDDEN(用户隐藏)
    reject_reason VARCHAR(500),                -- 驳回原因
    -- 时间戳
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_courtship_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_courtship_profile_status ON courtship_profiles(status);
CREATE INDEX idx_courtship_profile_gender_region ON courtship_profiles(gender, region);

-- 2. 心动意向表（A 对 B 表达心动，双向匹配后才能聊天）
CREATE TABLE courtship_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL,               -- 发起方
    to_user_id UUID NOT NULL,                 -- 对方
    message VARCHAR(300),                      -- 心动附言
    matched BOOLEAN NOT NULL DEFAULT FALSE,   -- 是否已互相心动（匹配成功）
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_courtship_like_from FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_courtship_like_to FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_courtship_like_from ON courtship_likes(from_user_id);
CREATE INDEX idx_courtship_like_to ON courtship_likes(to_user_id);
CREATE UNIQUE INDEX uk_courtship_like_pair ON courtship_likes(from_user_id, to_user_id);

-- 3. 匹配关系表（互相心动后建立，关联 chat_rooms 复用聊天功能）
CREATE TABLE courtship_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_a_id UUID NOT NULL,                  -- 较小 userId 的一方
    user_b_id UUID NOT NULL,                  -- 较大 userId 的一方
    room_id UUID NOT NULL,                    -- 关联聊天室（单聊）
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE(正常)/DISSOLVED(解除)
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_courtship_match_a FOREIGN KEY (user_a_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_courtship_match_b FOREIGN KEY (user_b_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_courtship_match_room FOREIGN KEY (room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE
);
CREATE INDEX idx_courtship_match_a ON courtship_matches(user_a_id);
CREATE INDEX idx_courtship_match_b ON courtship_matches(user_b_id);
CREATE UNIQUE INDEX uk_courtship_match_pair ON courtship_matches(LEAST(user_a_id, user_b_id), GREATEST(user_a_id, user_b_id));

-- 4. 见证分享表（成功配对后的婚姻/恋爱见证，需审核）
CREATE TABLE courtship_witnesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,                    -- 提交人
    title VARCHAR(150) NOT NULL,              -- 见证标题
    content TEXT NOT NULL,                     -- 见证内容
    photo_url TEXT,                            -- 见证图片（可选）
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING/APPROVED/REJECTED
    reject_reason VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_courtship_witness_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_courtship_witness_status ON courtship_witnesses(status, created_at DESC);

-- 5. 举报表
CREATE TABLE courtship_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL,                -- 举报人
    reported_id UUID NOT NULL,                -- 被举报人
    reason VARCHAR(20) NOT NULL,              -- INAPPROPRIATE(内容不当)/FAKE(虚假信息)/SPAM(骚扰)/OTHER(其他)
    detail VARCHAR(500),                       -- 详细说明
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING/RESOLVED
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_courtship_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_courtship_report_reported FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_courtship_report_status ON courtship_reports(status);
