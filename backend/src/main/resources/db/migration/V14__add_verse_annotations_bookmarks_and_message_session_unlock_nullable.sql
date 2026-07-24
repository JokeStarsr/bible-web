-- ============================================================
-- Flyway 数据库迁移脚本 V14
-- 1. 新增 user_verse_annotations（经文划线 + 默想）
-- 2. 新增 verse_bookmarks（经文收藏）
-- 3. 将 private_message_sessions.unlock_id 改为可空，
--    以支持基于共同划线解锁的私信会话
-- ============================================================

-- ==================== 经文划线与默想 ====================
CREATE TABLE IF NOT EXISTS user_verse_annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    version_id UUID NOT NULL,
    book_id UUID NOT NULL,
    chapter_number INTEGER NOT NULL,
    start_verse INTEGER NOT NULL,
    end_verse INTEGER NOT NULL,
    selected_text TEXT,
    note_content TEXT,
    visibility VARCHAR(20) NOT NULL DEFAULT 'private',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    CONSTRAINT fk_uva_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_uva_version FOREIGN KEY (version_id) REFERENCES bible_versions (id),
    CONSTRAINT fk_uva_book FOREIGN KEY (book_id) REFERENCES bible_books (id),
    CONSTRAINT chk_uva_visibility CHECK (visibility IN ('private', 'public')),
    CONSTRAINT chk_uva_verses CHECK (start_verse <= end_verse)
);

CREATE INDEX idx_uva_user_id ON user_verse_annotations (user_id);
CREATE INDEX idx_uva_book_chapter ON user_verse_annotations (version_id, book_id, chapter_number);
CREATE INDEX idx_uva_public_lookup ON user_verse_annotations (version_id, book_id, chapter_number, visibility) WHERE deleted_at IS NULL;

-- ==================== 经文收藏 ====================
CREATE TABLE IF NOT EXISTS verse_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    version_id UUID NOT NULL,
    book_id UUID NOT NULL,
    chapter_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_vb_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_vb_version FOREIGN KEY (version_id) REFERENCES bible_versions (id),
    CONSTRAINT fk_vb_book FOREIGN KEY (book_id) REFERENCES bible_books (id),
    CONSTRAINT uq_vb_user_verse UNIQUE (user_id, version_id, book_id, chapter_number, verse_number)
);

CREATE INDEX idx_vb_user_id ON verse_bookmarks (user_id);
CREATE INDEX idx_vb_lookup ON verse_bookmarks (version_id, book_id, chapter_number, verse_number);

-- ==================== 私信会话 unlock_id 可空 ====================
ALTER TABLE private_message_sessions ALTER COLUMN unlock_id DROP NOT NULL;
