-- 将赞美诗歌音源调整为国内平台/国内可访问的教会音乐资源
-- 1. public_domain 曲目改用 smallchurchmusic.com 的公共领域圣诗音频
-- 2. external_link 曲目改用网易云音乐搜索链接

-- 直接可播放的公共领域圣诗
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-AmazingGrace-SPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0003-000000000001';
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/2013/MP3/MP3-TheLordIsMyShepherd-Chinese-OPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0003-000000000002';
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-JesusWhatA-Hyfrydol-PipeLC-128-CAM.mp3' WHERE id = '00000000-0000-0000-0003-000000000003';
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3-2010/MP3-JesusLovesMe-China-SPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0003-000000000004';
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3-2010/MP3-BlessedAssurance-Knapp-SPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0003-000000000005';
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-HailHolyHolyHolyLord-Dunfermline-SPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0003-000000000006';
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/2015/MP3/MP3-HailHolyHoly-Dunfermline-SBand-128-CAM.mp3' WHERE id = '00000000-0000-0000-0003-000000000007';
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/2019/MP3/MP3-JesusWhatA-Hyfrydol-SBand-128-CAM.mp3' WHERE id = '00000000-0000-0000-0003-000000000008';

-- 外部链接改为网易云音乐搜索
UPDATE praise_tracks
SET external_url = REPLACE(external_url, 'https://duckduckgo.com/?q=', 'https://music.163.com/#/search/m/?s=')
WHERE external_url LIKE '%duckduckgo.com/?q=%'
  AND status = 'active';
