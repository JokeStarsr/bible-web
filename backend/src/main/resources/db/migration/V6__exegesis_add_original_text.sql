-- ============================================================
-- Flyway V6__exegesis_add_original_text.sql
-- 为解经记录表增加原文翻译注释和逐节解析字段
-- ============================================================

ALTER TABLE exegesis_records
    ADD COLUMN IF NOT EXISTS original_text_note TEXT DEFAULT '' NOT NULL,
    ADD COLUMN IF NOT EXISTS verse_by_verse TEXT DEFAULT '' NOT NULL;
