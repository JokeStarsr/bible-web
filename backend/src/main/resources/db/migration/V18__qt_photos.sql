ALTER TABLE qt_user_responses ADD COLUMN IF NOT EXISTS photos TEXT;
COMMENT ON COLUMN qt_user_responses.photos IS 'user uploaded photo paths, comma-separated';
