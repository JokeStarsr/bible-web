-- V22__add_korean_bible.sql
-- 添加韩文版圣经（개역한글판，1961年公共领域版本）

-- 1. 新增韩文版本记录
INSERT INTO bible_versions (id, code, name, language, copyright_notice, is_default, status, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000002', 'KORV', '개역한글판 (Korean Revised Version)', 'ko',
        'Public Domain (저작권 만료, 1961 대한성서공회)', false, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. 给 bible_books 表添加韩文书名字段
ALTER TABLE bible_books ADD COLUMN IF NOT EXISTS book_name_ko VARCHAR(100);

-- 3. 更新各书卷的韩文名（按 book_code 匹配）
UPDATE bible_books SET book_name_ko = '창세기' WHERE book_code = 'GEN';
UPDATE bible_books SET book_name_ko = '출애굽기' WHERE book_code = 'EXO';
UPDATE bible_books SET book_name_ko = '레위기' WHERE book_code = 'LEV';
UPDATE bible_books SET book_name_ko = '민수기' WHERE book_code = 'NUM';
UPDATE bible_books SET book_name_ko = '신명기' WHERE book_code = 'DEU';
UPDATE bible_books SET book_name_ko = '여호수아' WHERE book_code = 'JOS';
UPDATE bible_books SET book_name_ko = '사사기' WHERE book_code = 'JDG';
UPDATE bible_books SET book_name_ko = '룻기' WHERE book_code = 'RUT';
UPDATE bible_books SET book_name_ko = '사무엘상' WHERE book_code = '1SA';
UPDATE bible_books SET book_name_ko = '사무엘하' WHERE book_code = '2SA';
UPDATE bible_books SET book_name_ko = '열왕기상' WHERE book_code = '1KI';
UPDATE bible_books SET book_name_ko = '열왕기하' WHERE book_code = '2KI';
UPDATE bible_books SET book_name_ko = '역대상' WHERE book_code = '1CH';
UPDATE bible_books SET book_name_ko = '역대하' WHERE book_code = '2CH';
UPDATE bible_books SET book_name_ko = '에스라' WHERE book_code = 'EZR';
UPDATE bible_books SET book_name_ko = '느헤미야' WHERE book_code = 'NEH';
UPDATE bible_books SET book_name_ko = '에스더' WHERE book_code = 'EST';
UPDATE bible_books SET book_name_ko = '욥기' WHERE book_code = 'JOB';
UPDATE bible_books SET book_name_ko = '시편' WHERE book_code = 'PSA';
UPDATE bible_books SET book_name_ko = '잠언' WHERE book_code = 'PRO';
UPDATE bible_books SET book_name_ko = '전도서' WHERE book_code = 'ECC';
UPDATE bible_books SET book_name_ko = '아가' WHERE book_code = 'SNG';
UPDATE bible_books SET book_name_ko = '이사야' WHERE book_code = 'ISA';
UPDATE bible_books SET book_name_ko = '예레미야' WHERE book_code = 'JER';
UPDATE bible_books SET book_name_ko = '예레미야 애가' WHERE book_code = 'LAM';
UPDATE bible_books SET book_name_ko = '에스겔' WHERE book_code = 'EZK';
UPDATE bible_books SET book_name_ko = '다니엘' WHERE book_code = 'DAN';
UPDATE bible_books SET book_name_ko = '호세아' WHERE book_code = 'HOS';
UPDATE bible_books SET book_name_ko = '요엘' WHERE book_code = 'JOL';
UPDATE bible_books SET book_name_ko = '아모스' WHERE book_code = 'AMO';
UPDATE bible_books SET book_name_ko = '오바댜' WHERE book_code = 'OBA';
UPDATE bible_books SET book_name_ko = '요나' WHERE book_code = 'JON';
UPDATE bible_books SET book_name_ko = '미가' WHERE book_code = 'MIC';
UPDATE bible_books SET book_name_ko = '나훔' WHERE book_code = 'NAM';
UPDATE bible_books SET book_name_ko = '하박국' WHERE book_code = 'HAB';
UPDATE bible_books SET book_name_ko = '스바냐' WHERE book_code = 'ZEP';
UPDATE bible_books SET book_name_ko = '학개' WHERE book_code = 'HAG';
UPDATE bible_books SET book_name_ko = '스가랴' WHERE book_code = 'ZEC';
UPDATE bible_books SET book_name_ko = '말라기' WHERE book_code = 'MAL';
UPDATE bible_books SET book_name_ko = '마태복음' WHERE book_code = 'MAT';
UPDATE bible_books SET book_name_ko = '마가복음' WHERE book_code = 'MRK';
UPDATE bible_books SET book_name_ko = '누가복음' WHERE book_code = 'LUK';
UPDATE bible_books SET book_name_ko = '요한복음' WHERE book_code = 'JHN';
UPDATE bible_books SET book_name_ko = '사도행전' WHERE book_code = 'ACT';
UPDATE bible_books SET book_name_ko = '로마서' WHERE book_code = 'ROM';
UPDATE bible_books SET book_name_ko = '고린도전서' WHERE book_code = '1CO';
UPDATE bible_books SET book_name_ko = '고린도후서' WHERE book_code = '2CO';
UPDATE bible_books SET book_name_ko = '갈라디아서' WHERE book_code = 'GAL';
UPDATE bible_books SET book_name_ko = '에베소서' WHERE book_code = 'EPH';
UPDATE bible_books SET book_name_ko = '빌립보서' WHERE book_code = 'PHP';
UPDATE bible_books SET book_name_ko = '골로새서' WHERE book_code = 'COL';
UPDATE bible_books SET book_name_ko = '데살로니가전서' WHERE book_code = '1TH';
UPDATE bible_books SET book_name_ko = '데살로니가후서' WHERE book_code = '2TH';
UPDATE bible_books SET book_name_ko = '디모데전서' WHERE book_code = '1TI';
UPDATE bible_books SET book_name_ko = '디모데후서' WHERE book_code = '2TI';
UPDATE bible_books SET book_name_ko = '디도서' WHERE book_code = 'TIT';
UPDATE bible_books SET book_name_ko = '빌레몬서' WHERE book_code = 'PHM';
UPDATE bible_books SET book_name_ko = '히브리서' WHERE book_code = 'HEB';
UPDATE bible_books SET book_name_ko = '야고보서' WHERE book_code = 'JAS';
UPDATE bible_books SET book_name_ko = '베드로전서' WHERE book_code = '1PE';
UPDATE bible_books SET book_name_ko = '베드로후서' WHERE book_code = '2PE';
UPDATE bible_books SET book_name_ko = '요한1서' WHERE book_code = '1JN';
UPDATE bible_books SET book_name_ko = '요한2서' WHERE book_code = '2JN';
UPDATE bible_books SET book_name_ko = '요한3서' WHERE book_code = '3JN';
UPDATE bible_books SET book_name_ko = '유다서' WHERE book_code = 'JUD';
UPDATE bible_books SET book_name_ko = '요한계시록' WHERE book_code = 'REV';
