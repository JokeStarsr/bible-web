-- ============================================================
-- Flyway 数据库迁移脚本 V1__init.sql
-- 创建所有18张核心表及索引
-- 数据库: PostgreSQL
-- ============================================================

-- 1. users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    email_verified_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_status ON users (status);

-- 2. auth_credentials
CREATE TABLE auth_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    failed_login_count INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_auth_credentials_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_auth_credentials_user_id ON auth_credentials (user_id);

-- 3. password_reset_tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_password_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens (token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens (user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens (expires_at);

-- 4. email_verification_tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_email_verification_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 5. bible_versions
CREATE TABLE bible_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    language VARCHAR(20) NOT NULL,
    copyright_notice TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 6. bible_books
CREATE TABLE bible_books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL,
    book_order INTEGER NOT NULL,
    book_code VARCHAR(20) NOT NULL,
    book_name_zh VARCHAR(50) NOT NULL,
    book_name_en VARCHAR(50),
    testament VARCHAR(10) NOT NULL,
    chapter_count INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_bible_books_version FOREIGN KEY (version_id) REFERENCES bible_versions (id)
);

CREATE INDEX idx_bible_books_version_order ON bible_books (version_id, book_order);
CREATE INDEX idx_bible_books_version_code ON bible_books (version_id, book_code);

-- 7. bible_verses
CREATE TABLE bible_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id UUID NOT NULL,
    book_id UUID NOT NULL,
    chapter_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    verse_text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_bible_verses_version FOREIGN KEY (version_id) REFERENCES bible_versions (id),
    CONSTRAINT fk_bible_verses_book FOREIGN KEY (book_id) REFERENCES bible_books (id),
    CONSTRAINT uq_bible_verses UNIQUE (version_id, book_id, chapter_number, verse_number)
);

CREATE INDEX idx_bible_verses_book_chapter_verse ON bible_verses (book_id, chapter_number, verse_number);
CREATE INDEX idx_bible_verses_version_book_chapter ON bible_verses (version_id, book_id, chapter_number);

-- 8. scripture_generation_records
CREATE TABLE scripture_generation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    version_id UUID NOT NULL,
    generation_type VARCHAR(20) NOT NULL,
    book_id UUID NOT NULL,
    start_chapter INTEGER NOT NULL,
    start_verse INTEGER,
    end_chapter INTEGER NOT NULL,
    end_verse INTEGER,
    reference_text VARCHAR(255) NOT NULL,
    verse_count INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_sgr_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_sgr_version FOREIGN KEY (version_id) REFERENCES bible_versions (id),
    CONSTRAINT fk_sgr_book FOREIGN KEY (book_id) REFERENCES bible_books (id)
);

CREATE INDEX idx_sgr_user_id ON scripture_generation_records (user_id);

-- 9. exegesis_records
CREATE TABLE exegesis_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generation_record_id UUID NOT NULL,
    version_id UUID NOT NULL,
    reference_text VARCHAR(255) NOT NULL,
    source_type VARCHAR(20) NOT NULL,
    summary TEXT NOT NULL,
    historical_background TEXT NOT NULL,
    writing_background TEXT NOT NULL,
    context_analysis TEXT NOT NULL,
    keyword_analysis JSONB,
    canonical_position TEXT NOT NULL,
    theological_theme TEXT NOT NULL,
    truth_for_people TEXT NOT NULL,
    practical_application TEXT NOT NULL,
    reference_sources JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'generated',
    ai_model_name VARCHAR(100),
    prompt_version VARCHAR(50),
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_exegesis_sgr FOREIGN KEY (generation_record_id) REFERENCES scripture_generation_records (id),
    CONSTRAINT fk_exegesis_version FOREIGN KEY (version_id) REFERENCES bible_versions (id)
);

-- 10. highlight_notes
CREATE TABLE highlight_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    generation_record_id UUID NOT NULL,
    reference_text VARCHAR(255) NOT NULL,
    book_id UUID NOT NULL,
    start_chapter INTEGER NOT NULL,
    start_verse INTEGER NOT NULL,
    end_chapter INTEGER NOT NULL,
    end_verse INTEGER NOT NULL,
    selected_text TEXT NOT NULL,
    highlight_color VARCHAR(20) NOT NULL,
    note_content TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT fk_highlight_notes_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_highlight_notes_sgr FOREIGN KEY (generation_record_id) REFERENCES scripture_generation_records (id),
    CONSTRAINT fk_highlight_notes_book FOREIGN KEY (book_id) REFERENCES bible_books (id)
);

CREATE INDEX idx_highlight_notes_user_id ON highlight_notes (user_id);

-- 11. reflections
CREATE TABLE reflections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    generation_record_id UUID NOT NULL,
    reference_text VARCHAR(255) NOT NULL,
    title VARCHAR(200),
    content TEXT NOT NULL,
    visibility VARCHAR(20) NOT NULL DEFAULT 'private',
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    draft_saved_at TIMESTAMP,
    published_at TIMESTAMP,
    comment_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT fk_reflections_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_reflections_sgr FOREIGN KEY (generation_record_id) REFERENCES scripture_generation_records (id)
);

CREATE INDEX idx_reflections_user_visibility_status ON reflections (user_id, visibility, status);
CREATE INDEX idx_reflections_visibility_status_published ON reflections (visibility, status, published_at);

-- 12. reflection_comments
CREATE TABLE reflection_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reflection_id UUID NOT NULL,
    user_id UUID NOT NULL,
    parent_comment_id UUID,
    root_comment_id UUID,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'published',
    interaction_round_seq INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT fk_reflection_comments_reflection FOREIGN KEY (reflection_id) REFERENCES reflections (id),
    CONSTRAINT fk_reflection_comments_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_reflection_comments_reflection_created ON reflection_comments (reflection_id, created_at);

-- 13. message_unlocks
CREATE TABLE message_unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reflection_id UUID NOT NULL,
    user_a_id UUID NOT NULL,
    user_b_id UUID NOT NULL,
    trigger_comment_id UUID,
    trigger_round_count INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending_acceptance',
    unlocked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_message_unlocks_reflection FOREIGN KEY (reflection_id) REFERENCES reflections (id),
    CONSTRAINT fk_message_unlocks_user_a FOREIGN KEY (user_a_id) REFERENCES users (id),
    CONSTRAINT fk_message_unlocks_user_b FOREIGN KEY (user_b_id) REFERENCES users (id),
    CONSTRAINT uq_message_unlocks UNIQUE (reflection_id, user_a_id, user_b_id)
);

-- 14. private_message_sessions
CREATE TABLE private_message_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unlock_id UUID NOT NULL,
    user_a_id UUID NOT NULL,
    user_b_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    last_message_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_pms_unlock FOREIGN KEY (unlock_id) REFERENCES message_unlocks (id),
    CONSTRAINT fk_pms_user_a FOREIGN KEY (user_a_id) REFERENCES users (id),
    CONSTRAINT fk_pms_user_b FOREIGN KEY (user_b_id) REFERENCES users (id)
);

-- 15. private_messages
CREATE TABLE private_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'sent',
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT fk_private_messages_session FOREIGN KEY (session_id) REFERENCES private_message_sessions (id),
    CONSTRAINT fk_private_messages_sender FOREIGN KEY (sender_id) REFERENCES users (id)
);

CREATE INDEX idx_private_messages_session_created ON private_messages (session_id, created_at);

-- 16. praise_tracks
CREATE TABLE praise_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255),
    cover_image_url TEXT,
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER,
    source_type VARCHAR(20) NOT NULL,
    copyright_note TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 17. reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    target_id UUID NOT NULL,
    reason_code VARCHAR(30) NOT NULL,
    reason_detail TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    handled_by UUID,
    handled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users (id)
);

CREATE INDEX idx_reports_reporter_id ON reports (reporter_id);
CREATE INDEX idx_reports_status ON reports (status);

-- 18. admin_action_logs
CREATE TABLE admin_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(30) NOT NULL,
    target_id UUID,
    action_detail JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_admin_action_logs_admin FOREIGN KEY (admin_user_id) REFERENCES users (id)
);