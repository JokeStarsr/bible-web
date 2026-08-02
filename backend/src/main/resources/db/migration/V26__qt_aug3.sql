-- ============================================================
-- Flyway 迁移脚本 V26__qt_aug3.sql
-- 填充 2026-08-03（周一）灵修内容：平安的约与蒙福的人生（以西结书 34:25~31）
-- 排版格式对齐既有日期（如 2026-08-01）：
--   scripture_text：中文行 + 英文行成对，节对之间空行分隔
--   commentary：以空行分块，首行命中标题模式（今日经文摘要/经文解释小标题｜章：节/今日祷告/默想散文/一节默想）醒目展示
--   hymn：首行为诗歌名，正文按行，末尾以「— 三一敬拜系列2《直到列国万民看见主》」标注来源
-- 使用 ON CONFLICT (qt_date) DO UPDATE 保证幂等，可重复执行
-- ============================================================

-- 防御性补齐韩文正文/注释/诗歌字段（与 MyBatis 映射 QtDailyContentMapper 保持一致）。
-- 历史迁移仅补了 title_ko / scripture_reference_ko（V21），此处补齐剩余三个 _ko 字段，
-- 消除「迁移脚本与 Mapper 引用列不一致」的隐患；已存在则为 no-op。
ALTER TABLE qt_daily_contents ADD COLUMN IF NOT EXISTS scripture_text_ko TEXT;
ALTER TABLE qt_daily_contents ADD COLUMN IF NOT EXISTS commentary_ko TEXT;
ALTER TABLE qt_daily_contents ADD COLUMN IF NOT EXISTS hymn_ko TEXT;

INSERT INTO qt_daily_contents(
    id, qt_date, title, scripture_reference, scripture_text, commentary, hymn,
    title_ko, scripture_reference_ko, scripture_text_ko, commentary_ko, hymn_ko
) VALUES (
    gen_random_uuid(),
    DATE '2026-08-03',
    '平安的约与蒙福的人生',
    '以西结书 34:25~31',
    TRIM(BOTH E'\n' FROM $scripture$
25 我必与他们立平安的约，使恶兽从境内断绝，他们就必安居在旷野，躺卧在林中。
25 "I will make a covenant of peace with them and rid the land of savage beasts so that they may live in the wilderness and sleep in the forests in safety.

26 我必使他们与我山的四围成为福源，我也必叫时雨落下，必有福如甘霖而降。
26 I will make them and the places surrounding my hill a blessing. I will send down showers in season; there will be showers of blessing.

27 田野的树必结果，地也必有出产；他们必在故土安然居住。我折断他们所负的轭，救他们脱离那以他们为奴之人的手；那时，他们就知道我是耶和华。
27 The trees will yield their fruit and the ground will yield its crops; the people will be secure in their land. They will know that I am the LORD, when I break the bars of their yoke and rescue them from the hands of those who enslaved them.

28 他们必不再作外邦人的掠物，地上的野兽也不再吞吃他们；却要安然居住，无人惊吓。
28 They will no longer be plundered by the nations, nor will wild animals devour them. They will live in safety, and no one will make them afraid.

29 我必给他们兴起有名的植物；他们在境内不再为饥荒所灭，也不再受外邦人的羞辱，
29 I will provide for them a land renowned for its crops, and they will no longer be victims of famine in the land or bear the scorn of the nations.

30 必知道我、耶和华—他们的神是与他们同在的，并知道他们—以色列家是我的民。这是主耶和华说的。
30 Then they will know that I, the LORD their God, am with them and that they, the Israelites, are my people, declares the Sovereign LORD.

31 你们作我的羊，我草场上的羊，乃是以色列人，我也是你们的神。这是主耶和华说的。」
31 You are my sheep, the sheep of my pasture, and I am your God, declares the Sovereign LORD."
$scripture$),
    TRIM(BOTH E'\n' FROM $commentary$
今日经文摘要
神要与以色列人立平安的约，使恶兽断绝，他们不再成为外邦人的掠物，神也会折断百姓所负的轭，救他们脱离奴役。祂要降下雨，使他们在有果子和出产的土地上平安居住。以色列人必知道神与他们同在，也知道他们是神的百姓。

平安的约｜34：25～28
神应许要恢复祂与百姓之间，因罪而受破坏的「平安的约」（25节）。当神「使恶兽从境内断绝」，百姓即使在旷野也能安然居住。神必降下雨，地上的树木就要结果，田地也必有出产。如此，立约百姓必得享受神在摩西律法中所应许的福分（利26：3～6）。当他们经历神「折断他们所负的轭」（27节）、救他们脱离压制，使他们不再受威胁、能安然居住时，立约百姓就要承认耶和华是神。这约已在耶稣里立定救赎根基，并要在祂国度全然彰显时完全成就。在耶稣里，基督徒不再是罪的奴仆，而是得享祂同在与福分的新约百姓。

「平安的约」使神的百姓得享什么益处？作为立约百姓，我具体得享哪些恩典？

神与人之间的关系｜34：29～31
神亲自看顾祂百姓的生命与前途。神必兴起「有名的植物」，使土地恢复出产、丰盛供应，百姓「不再为饥荒所灭，也不再受外邦人的羞辱」（29节）。经文中反复使用「不再」，旨在强调神要彻底扭转百姓被掠夺、受饥荒与蒙羞辱的处境，彰显祂恢复应许的信实可靠。以色列人是「神所牧养的羊」（31节），这话再次坚固神与祂百姓之间的恩典关系。立约关系的核心就是神与祂的百姓同在，祂作他们的神，他们作祂的民（30～31节）；这一应许也在新约中借着耶稣基督临到一切信靠祂的人。因此，今日基督徒也当在缺乏与羞辱中信靠神，仰望祂的供应与同在。

借着新约，神应许与我们建立怎样的关系？全能的神是我的神，我是祂牧养的羊，这事实给我什么盼望？

今日祷告
神啊，赞美祢借着耶稣基督的十字架立下平安的约，并以救赎的恩典使我安然居住。求祢使我每时刻都记得：祢是「我的神」，我是「神的百姓」。求神使我喜乐地向世人传扬：祢按时施行拯救，也按时施予帮助。

默想散文
不改变的爱
硕果累累的神学
罗思·塞尔茨
默想神与信靠神之间，存在着直接与紧密的关连。你或许曾有过这样的经历：当你越认识一位朋友、老师，或某个你尊敬的人，就越容易感到幻灭。因为随着距离的拉近，就越容易看见人的缺点。然而在神的神圣属性中，绝不会发生这样的事。透过祂的话语，我们越学习认识神，以及一切与真理有关的事，就越能深刻领悟神是值得信靠的那一位。在圣经中，神不断证明祂那永不改变的爱。当以色列百姓在埃及为奴之时，或是在旷野漂流之际，神始终持续不断地证明祂对百姓的爱。之后，当他们先后被亚述、巴比伦、波斯统治，甚至在神静默不语的数百年岁月中，神的那份爱依然持续显明，未曾断绝。当神的百姓迫切盼望弥赛亚，并且需要从罪与羞辱中得着完全救赎的时刻，神借着耶稣基督的十字架与复活，为那份爱作了永恒的证明。
当我们全心信靠神的爱，并默想神的话语时，我们的灵魂就会得着深切的平安。纵然外在世界因混乱与骚动而喧嚷不已，我们的内在灵魂仍会归于寂静。当我们的思想转向神时，我们的灵魂就能在祂里面享受安息。因此，奥古斯丁写着：「可不要错了！我们的心若不在神里面得着安息，便永不得安息。」
我们虽不是受害、还被蔑视的。这是因神主动的爱。

一节默想
以西结书34：30｜以色列百姓经历的管教与恢复，乃是更认识神的属灵旅程。神不让苦难的百姓孤单，祂向他们确认：「我耶和华他们的神是与他们同在。」这彰显了不以环境改变的恩典：唯有信靠「与我同在的神」。无论环境如何，圣徒得胜的力量来自信靠「与我同在的神」。

折断他们所负的轭（27节）：形容脱离奴役与压制，经历如同「出埃及」般的真自由。
不再（28、29节）：希伯来文「ʿôd」有「仍、再、更多、继续」等意思；与否定词「lô」（不）连用时，常表达「不再、再也不」的决绝意志。此语汇反复出现，是强调耶和华要终止祂百姓被掠夺、受饥荒与蒙羞辱的处境，显明祂所立「平安的约」是永远且确实可靠的。
全年读经 □士17 □徒21 □耶30～31 □可16
$commentary$),
    TRIM(BOTH E'\n' FROM $hymn$
蒙神祝福的人
你必靠主心中得着力量，你的心真想往锡安的大道。蒙神所爱、蒙神所赐福的人，主是何等喜悦你、何等宝贵你。你渴望住在神殿中胜过一切，终日仰望主并称颂赞美祂。蒙神所爱，蒙神所赐福的人……。

— 三一敬拜系列2《直到列国万民看见主》
$hymn$),
    NULL, NULL, NULL, NULL, NULL
)
ON CONFLICT (qt_date) DO UPDATE SET
    title = EXCLUDED.title,
    scripture_reference = EXCLUDED.scripture_reference,
    scripture_text = EXCLUDED.scripture_text,
    commentary = EXCLUDED.commentary,
    hymn = EXCLUDED.hymn,
    updated_at = NOW();
