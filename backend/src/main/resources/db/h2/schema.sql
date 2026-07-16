-- ==================== H2 数据库初始化脚本 ====================
-- 用于本地开发环境，H2 内存数据库

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE,
    openid VARCHAR(64) UNIQUE,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 认证凭证
CREATE TABLE IF NOT EXISTS auth_credentials (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    password_hash TEXT NOT NULL,
    password_updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    failed_login_count INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 密码重置令牌
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 邮箱验证令牌
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 圣经版本
CREATE TABLE IF NOT EXISTS bible_versions (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    language VARCHAR(20) NOT NULL,
    copyright_notice TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 圣经书卷
CREATE TABLE IF NOT EXISTS bible_books (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    version_id UUID NOT NULL REFERENCES bible_versions(id),
    book_order INTEGER NOT NULL,
    book_code VARCHAR(20) NOT NULL,
    book_name_zh VARCHAR(50) NOT NULL,
    book_name_en VARCHAR(50),
    testament VARCHAR(10) NOT NULL,
    chapter_count INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 经文
CREATE TABLE IF NOT EXISTS bible_verses (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    version_id UUID NOT NULL REFERENCES bible_versions(id),
    book_id UUID NOT NULL REFERENCES bible_books(id),
    chapter_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(version_id, book_id, chapter_number, verse_number)
);

-- 经文生成记录
CREATE TABLE IF NOT EXISTS scripture_generation_records (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    version_id UUID NOT NULL REFERENCES bible_versions(id),
    generation_type VARCHAR(20) NOT NULL,
    book_id UUID NOT NULL REFERENCES bible_books(id),
    start_chapter INTEGER NOT NULL,
    start_verse INTEGER,
    end_chapter INTEGER NOT NULL,
    end_verse INTEGER,
    reference_text VARCHAR(255) NOT NULL,
    verse_count INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 解经记录
CREATE TABLE IF NOT EXISTS exegesis_records (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    generation_record_id UUID REFERENCES scripture_generation_records(id),
    version_id UUID NOT NULL REFERENCES bible_versions(id),
    reference_text VARCHAR(255) NOT NULL,
    source_type VARCHAR(20) NOT NULL,
    summary TEXT NOT NULL,
    historical_background TEXT NOT NULL,
    writing_background TEXT NOT NULL,
    context_analysis TEXT NOT NULL,
    keyword_analysis TEXT,
    canonical_position TEXT NOT NULL,
    theological_theme TEXT NOT NULL,
    truth_for_people TEXT NOT NULL,
    practical_application TEXT NOT NULL,
    reference_sources TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'generated',
    ai_model_name VARCHAR(100),
    prompt_version VARCHAR(50),
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 高亮标注
CREATE TABLE IF NOT EXISTS highlight_notes (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    generation_record_id UUID REFERENCES scripture_generation_records(id),
    reference_text VARCHAR(255) NOT NULL,
    book_id UUID NOT NULL REFERENCES bible_books(id),
    start_chapter INTEGER NOT NULL,
    start_verse INTEGER NOT NULL,
    end_chapter INTEGER NOT NULL,
    end_verse INTEGER NOT NULL,
    selected_text TEXT NOT NULL,
    highlight_color VARCHAR(20) NOT NULL,
    note_content TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 灵修感悟
CREATE TABLE IF NOT EXISTS reflections (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    generation_record_id UUID REFERENCES scripture_generation_records(id),
    reference_text VARCHAR(255) NOT NULL,
    title VARCHAR(200),
    content TEXT NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'private',
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    draft_saved_at TIMESTAMP,
    published_at TIMESTAMP,
    comment_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 评论
CREATE TABLE IF NOT EXISTS reflection_comments (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    reflection_id UUID NOT NULL REFERENCES reflections(id),
    user_id UUID NOT NULL REFERENCES users(id),
    parent_comment_id UUID,
    root_comment_id UUID,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'published',
    interaction_round_seq INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 私信解锁
CREATE TABLE IF NOT EXISTS message_unlocks (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    reflection_id UUID NOT NULL REFERENCES reflections(id),
    user_a_id UUID NOT NULL REFERENCES users(id),
    user_b_id UUID NOT NULL REFERENCES users(id),
    trigger_comment_id UUID,
    trigger_round_count INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending_acceptance',
    unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(reflection_id, user_a_id, user_b_id)
);

-- 私信会话
CREATE TABLE IF NOT EXISTS private_message_sessions (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    unlock_id UUID REFERENCES message_unlocks(id),
    user_a_id UUID NOT NULL REFERENCES users(id),
    user_b_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    last_message_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 私信消息
CREATE TABLE IF NOT EXISTS private_messages (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES private_message_sessions(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 赞美资源
CREATE TABLE IF NOT EXISTS praise_tracks (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255),
    cover_image_url TEXT,
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER,
    source_type VARCHAR(20) NOT NULL,
    copyright_note TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 举报
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES users(id),
    target_type VARCHAR(30) NOT NULL,
    target_id UUID NOT NULL,
    reason_code VARCHAR(30) NOT NULL,
    reason_detail TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    handled_by UUID,
    handled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 管理员操作日志
CREATE TABLE IF NOT EXISTS admin_action_logs (
    id UUID DEFAULT RANDOM_UUID() PRIMARY KEY,
    admin_user_id UUID NOT NULL REFERENCES users(id),
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    target_id UUID,
    action_detail TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==================== 索引 ====================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_auth_credentials_user_id ON auth_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_bible_books_version_order ON bible_books(version_id, book_order);
CREATE INDEX IF NOT EXISTS idx_bible_books_version_code ON bible_books(version_id, book_code);
CREATE INDEX IF NOT EXISTS idx_bible_verses_book_chapter_verse ON bible_verses(book_id, chapter_number, verse_number);
CREATE INDEX IF NOT EXISTS idx_sgr_user_id ON scripture_generation_records(user_id);
CREATE INDEX IF NOT EXISTS idx_highlight_notes_user_id ON highlight_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_reflections_user_visibility ON reflections(user_id, visibility, status);
CREATE INDEX IF NOT EXISTS idx_reflections_public ON reflections(visibility, status, published_at);
CREATE INDEX IF NOT EXISTS idx_reflection_comments_reflection ON reflection_comments(reflection_id, created_at);
CREATE INDEX IF NOT EXISTS idx_private_messages_session ON private_messages(session_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);