-- QT分享功能数据库表
CREATE TABLE qt_daily_contents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qt_date DATE NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    scripture_reference VARCHAR(500),
    scripture_text TEXT NOT NULL,
    commentary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_qt_daily_contents_date ON qt_daily_contents (qt_date);

CREATE TABLE qt_user_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    qt_content_id UUID NOT NULL,
    meditation TEXT,
    application TEXT,
    prayer TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_qt_user_responses_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_qt_user_responses_content FOREIGN KEY (qt_content_id) REFERENCES qt_daily_contents (id),
    CONSTRAINT uq_qt_user_responses_user_content UNIQUE (user_id, qt_content_id)
);
CREATE INDEX idx_qt_user_responses_content_id ON qt_user_responses (qt_content_id);
CREATE INDEX idx_qt_user_responses_user_id ON qt_user_responses (user_id);
