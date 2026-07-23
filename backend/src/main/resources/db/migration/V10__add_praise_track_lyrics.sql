-- 扩展 praise_tracks 表，支持仅展示歌词/官方平台链接的诗歌
ALTER TABLE praise_tracks
    ALTER COLUMN audio_url DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS lyrics TEXT,
    ADD COLUMN IF NOT EXISTS external_url TEXT;
