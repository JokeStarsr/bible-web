-- V16: 修复赞美诗播放问题
-- 1. 将 V9 中 faithchinesechurch.org 曲目的 source_type 从 'external' 改为 'public_domain'
--    使这些国内可访问的真实赞美诗音频能被加权随机算法选中
-- 2. 额外新增更多 faithchinesechurch.org 真实中文赞美诗曲目

-- ==================== 修正 V9 曲目的 source_type ====================
UPDATE praise_tracks SET source_type = 'public_domain', updated_at = NOW()
WHERE source_type = 'external'
  AND status = 'active'
  AND audio_url LIKE '%faithchinesechurch.org%';

-- ==================== 额外新增 faithchinesechurch.org 赞美诗曲目 ====================
INSERT INTO praise_tracks (id, title, artist_name, cover_image_url, audio_url, duration_seconds, source_type, copyright_note, status, created_at, updated_at)
VALUES
    -- 颂主圣诗 更多曲目
    ('00000000-0000-0000-0006-000000000001', '荣耀归于真神', '颂主圣诗', NULL, 'https://faithchinesechurch.org/hymns/Hymns_of_Praise/001%20%E8%8D%A3%E8%80%80%E5%BD%92%E4%BA%8E%E7%9C%9F%E7%A5%9E%20-%20%E9%9F%B3%E9%A2%91.m4a', 180, 'public_domain', '来源：faithchinesechurch.org', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0006-000000000002', '圣哉圣哉圣哉', '颂主圣诗', NULL, 'https://faithchinesechurch.org/hymns/Hymns_of_Praise/002%20%E5%9C%A3%E5%93%89%E5%9C%A3%E5%93%89%E5%9C%A3%E5%93%89%20-%20%E9%9F%B3%E9%A2%91.m4a', 180, 'public_domain', '来源：faithchinesechurch.org', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0006-000000000003', '赞美全能神', '颂主圣