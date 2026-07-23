-- 今日随想历史记录表
CREATE TABLE daily_thought_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    pastoral_response TEXT,
    divine_word TEXT,
    scriptures JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_daily_thought_records_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_daily_thought_records_user_id_created_at ON daily_thought_records (user_id, created_at DESC);
