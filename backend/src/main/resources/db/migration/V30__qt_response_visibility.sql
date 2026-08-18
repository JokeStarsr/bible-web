-- 为 QT 用户回应表添加可见范围字段
-- visibility: 'PUBLIC' 可共享（其他用户都能看见）/ 'PRIVATE' 仅自己看见
-- 默认 'PUBLIC' 以保持向后兼容（历史已保存的回应默认对所有用户可见）
ALTER TABLE qt_user_responses ADD COLUMN IF NOT EXISTS visibility VARCHAR(16) NOT NULL DEFAULT 'PUBLIC';
COMMENT ON COLUMN qt_user_responses.visibility IS '可见范围：PUBLIC=可共享（其他用户可见），PRIVATE=仅自己看见';
