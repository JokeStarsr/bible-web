-- 新增更多 public_domain 赞美诗曲目，来自 smallchurchmusic.com 公共领域圣诗音频
-- 并为部分 external_link 中文曲目设置 smallchurchmusic.com 兜底音频链接

-- ==================== 新增 30 首 public_domain 传统圣诗 ====================
INSERT INTO praise_tracks (id, title, artist_name, cover_image_url, audio_url, duration_seconds, lyrics, external_url, source_type, copyright_note, status, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0005-000000000001', '你真伟大', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-HowGreatThouArt-SPiano-128-CAM.mp3', 300, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000002', '我心灵得安宁', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-ItIsWellWithMySoul-VilleDuHavre-SPiano-128-CAM.mp3', 280, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000003', '你信实何广大', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-GreatIsThyFaithfulness-Faithfulness-OPiano-128-CAM.mp3', 270, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000004', '圣哉圣哉圣哉', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-HolyHolyHoly-Nicaea-SPiano-128-CAM.mp3', 260, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000005', '成为我异象', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-BeThouMyVision-Slane-SPiano-128-CAM.mp3', 240, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000006', '万福源头', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-ComeThouFount-Nettleton-SPiano-128-CAM.mp3', 270, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000007', '万古磐石', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-RockOfAges-Toplady-OPiano-128-CAM.mp3', 250, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000008', '一切受造之物', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-AllCreaturesOfOurGodAndKing-LasstUnsErfreuen-SPiano-128-CAM.mp3', 300, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000009', '思念奇妙十架', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-WhenISurveyTheWondrousCross-Hamburg-SPiano-128-CAM.mp3', 280, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000010', '古旧十架', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-TheOldRuggedCross-SPiano-128-CAM.mp3', 290, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000011', '耶稣恩友', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-WhatAFriendWeHaveInJesus-Converse-SPiano-128-CAM.mp3', 260, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000012', '更近我主', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-NearerMyGodToThee-Bethany-OPiano-128-CAM.mp3', 270, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000013', '与我同住', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-AbideWithMe-Eventide-SPiano-128-CAM.mp3', 260, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000014', '美哉主耶稣', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-FairestLordJesus-CrusadersHymn-SPiano-128-CAM.mp3', 250, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000015', '全献在坛上', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-ISurrenderAll-SPiano-128-CAM.mp3', 260, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000016', '照我本相', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-JustAsIAm-Woodworth-OPiano-128-CAM.mp3', 250, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000017', '惟靠主宝血', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-NothingButTheBlood-Plainfield-SPiano-128-CAM.mp3', 240, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000018', '赞美全能主', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-PraiseToTheLordTheAlmighty-LobeDenHerren-SPiano-128-CAM.mp3', 270, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000019', '当转眼仰望耶稣', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-TurnYourEyesUponJesus-SPiano-128-CAM.mp3', 250, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000020', '靠主耶稣甘甜', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-TisSoSweetToTrustInJesus-OPiano-128-CAM.mp3', 260, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000021', '信靠顺服', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-TrustAndObey-SPiano-128-CAM.mp3', 250, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000022', '这是天父世界', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-ThisIsMyFathersWorld-TerraBeata-SPiano-128-CAM.mp3', 260, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000023', '教会独一根基', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-TheChurchsOneFoundation-Aurelia-SPiano-128-CAM.mp3', 280, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000024', '有一活泉', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-ThereIsAFountain-CleansingFountain-OPiano-128-CAM.mp3', 270, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000025', '荣耀归于真神', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-ToGodBeTheGlory-SPiano-128-CAM.mp3', 260, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000026', '怎能如此', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-AndCanItBe-Sagina-SPiano-128-CAM.mp3', 300, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000027', '冠冕加于主首', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-CrownHimWithManyCrowns-Diademata-SPiano-128-CAM.mp3', 280, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000028', '齐来赞美耶稣圣名', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-AllHailThePowerOfJesusName-Coronation-SPiano-128-CAM.mp3', 270, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000029', '主耶稣我爱你', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-MyJesusILoveThee-Gordon-OPiano-128-CAM.mp3', 250, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW()),
    ('00000000-0000-0000-0005-000000000030', '依靠主永远膀臂', '传统圣诗', NULL, 'https://www.smallchurchmusic.com/MP3/MP3-LeaningOnTheEverlastingArms-Showalter-SPiano-128-CAM.mp3', 240, NULL, NULL, 'public_domain', '公共领域圣诗，来自 smallchurchmusic.com', 'active', NOW(), NOW());

-- ==================== 为 external_link 中文曲目设置 smallchurchmusic.com 兜底音频 ====================
-- 以下为部分中文当代敬拜曲目提供与主题相近的传统圣诗作为兜底音频，
-- 当用户无法访问 YouTube 等外部平台时，仍可播放传统圣诗背景音乐。

-- 赞美之泉 — 部分曲目与经典圣诗主题相近，设置兜底音频
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-AllCreaturesOfOurGodAndKing-LasstUnsErfreuen-SPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0004-000000000006'; -- 全能的创造主 → All Creatures of Our God and King
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-HowGreatThouArt-SPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0004-000000000003'; -- 有一位神 → How Great Thou Art
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-GreatIsThyFaithfulness-Faithfulness-OPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0004-000000000002'; -- 耶和华祝福满满 → Great Is Thy Faithfulness

-- 约书亚敬拜团 — 部分曲目设置兜底音频
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-CrownHimWithManyCrowns-Diademata-SPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0004-000000000014'; -- 神羔羊配得 → Crown Him with Many Crowns
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-BeThouMyVision-Slane-SPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0004-000000000021'; -- 耶稣你是中心 → Be Thou My Vision
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-FairestLordJesus-CrusadersHymn-SPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0004-000000000023'; -- 何等荣美的名 → Fairest Lord Jesus
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-ItIsWellWithMySoul-VilleDuHavre-SPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0004-000000000022'; -- 安静 → It Is Well With My Soul

-- 小羊诗歌 — 部分曲目设置兜底音频
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-AllHailThePowerOfJesusName-Coronation-SPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0004-000000000047'; -- 耶稣万名之上的名 → All Hail the Power of Jesus' Name
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-ISurrenderAll-SPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0004-000000000038'; -- 我愿意 → I Surrender All
UPDATE praise_tracks SET audio_url = 'https://www.smallchurchmusic.com/MP3/MP3-MyJesusILoveThee-Gordon-OPiano-128-CAM.mp3' WHERE id = '00000000-0000-0000-0004-000000000048'; -- 谢谢你耶稣 → My Jesus I Love Thee

-- 韩语曲目保持 external_link only，不设置兜底音频