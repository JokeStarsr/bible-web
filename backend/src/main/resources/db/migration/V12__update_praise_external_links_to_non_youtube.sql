-- 将赞美诗歌外部链接从 YouTube 搜索替换为 DuckDuckGo 搜索
-- 目的：避免直接指向 YouTube，同时保留曲目搜索入口

UPDATE praise_tracks
SET external_url = REPLACE(external_url, 'https://www.youtube.com/results?search_query=', 'https://duckduckgo.com/?q=')
WHERE external_url LIKE '%youtube.com/results?search_query=%'
  AND status = 'active';
