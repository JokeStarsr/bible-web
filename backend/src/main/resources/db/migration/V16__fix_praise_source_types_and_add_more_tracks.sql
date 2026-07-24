-- 修复赞美诗 source_type 并增加更多可播放曲目
-- 1. 将 V9 中 faithchinesechurch.org 曲目的 source_type 从 'external' 改为 'public_domain'
--    使其能被 PraiseService 的加权随机算法查询到
-- 2. 新增更多 faithchinesechurch.org 的中文赞美诗

-- ==================== 修复 V9 曲目的 source_type ====================
UPDATE praise_tracks SET source_type = 'public_domain', updated_at = NOW()
WHERE source_type = 'external'
  AND audio_url LIKE '%faithchinesechurch.org%'
  AND status = 'active';

-- ==================== 新增更多 faithchinesechurch.org 中文赞美诗 ====================
INSERT INTO praise_tracks (id, title, artist_name, cover_image_url, audio_url, duration_seconds, source_type, copyright_note, status, created_at, updated_at)
VALUES
    -- 颂主圣诗 更多曲目
    ('00000000-0000-0000-0006-000000000001', '千古保障', '颂主圣诗', NULL, 'https://faithchinesechurch.org/hymns/Hymns_of_Praise/015%20%E5%8D%83%E5%8F%A4%E4%BF%9D%E9%9A%9C%20-%20%E9%9F%B3%E9%A2%91.m4a', 180, 'public_domain', '来源：faithchinesechurch.org', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0006-000000000002', '快乐崇拜', '颂主圣诗', NULL, 'https://faithchinesechurch.org/hymns/Hymns_of_Praise/017%20%E5%BF%AB%E4%B9%90%E5%B4%87%E6%8B%9C%20-%20%E9%9F%B3%E9%A2%91.m4a', 180, 'public_domain', '来源：faithchinesechurch.org', 'active', NOW(), NOW()),
    ('00000000-0000-0000-000