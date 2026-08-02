-- V21__add_ko_title_and_ref_to_qt.sql
-- 为 qt_daily_contents 添加韩文标题和经文索引字段
ALTER TABLE qt_daily_contents ADD COLUMN IF NOT EXISTS title_ko TEXT;
ALTER TABLE qt_daily_contents ADD COLUMN IF NOT EXISTS scripture_reference_ko TEXT;

-- 回填现有记录的韩文数据
UPDATE qt_daily_contents SET title_ko = '생수의 강', scripture_reference_ko = '요한복음 7:37-39' WHERE qt_date = '2026-07-25' AND title_ko IS NULL;
UPDATE qt_daily_contents SET title_ko = '폭풍 속의 안식', scripture_reference_ko = '마가복음 4:35-41' WHERE qt_date = '2026-07-26' AND title_ko IS NULL;
UPDATE qt_daily_contents SET title_ko = '물을 흐리게 하는 죄', scripture_reference_ko = '에스겔서 32:1~16' WHERE qt_date = '2026-07-27' AND title_ko IS NULL;
UPDATE qt_daily_contents SET title_ko = '죽은 자의 영역', scripture_reference_ko = '에스겔서 32:17~32' WHERE qt_date = '2026-07-28' AND title_ko IS NULL;
