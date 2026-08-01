-- ============================================================
-- Flyway 迁移脚本 V29__qt_aug6.sql
-- 填充 2026-08-06（周四）灵修内容：神所赐的新灵、新心（以西结书 36:16~31）
-- 排版对齐 2026-08-01：
--   scripture_text：16-23节原书有英文→双语对照；24-31节原书标注未放英文→仅中文；每节间空行分隔
--   commentary：以空行分块；散文段落拆为独立块；金句块去装饰线（对齐 08-01）；脚注/全年读经合为单块
--   hymn：首行为诗歌名，正文按行，末尾以「— 三一敬拜系列2《直到列国万民看见主》」标注来源
-- TRIM(BOTH E'\n' ...) 去除美元引用首尾换行，确保首行命中标题模式
-- ON CONFLICT (qt_date) DO UPDATE 保证幂等
-- ============================================================

INSERT INTO qt_daily_contents(
    id, qt_date, title, scripture_reference, scripture_text, commentary, hymn,
    title_ko, scripture_reference_ko, scripture_text_ko, commentary_ko, hymn_ko
) VALUES (
    gen_random_uuid(),
    DATE '2026-08-06',
    '神所赐的新灵、新心',
    '以西结书 36:16~31',
    TRIM(BOTH E'\n' FROM $scripture$
16 耶和华的话又临到我说：
16 Again the word of the LORD came to me:

17「人子啊，以色列家住在本地的时候，在行动作上玷污那地。他们的行为在我面前，好像正在经期的妇人那样污秽。
17 "Son of man, when the people of Israel were living in their own land, they defiled it by their conduct and their actions. Their conduct was like a woman's monthly uncleanness in my sight.

18 所以我因他们在那地上流人的血，又因他们以偶像玷污那地，就把我的忿怒倾在他们身上。
18 So I poured out my wrath on them because they had shed blood in the land and because they had defiled it with their idols.

19 我将他们分散在列国，四散在列邦，按他们的行动作为惩罚他们。
19 I dispersed them among the nations, and they were scattered through the countries; I judged them according to their conduct and their actions.

20 他们到了所去的列国，就使我的圣名被亵渎；因为人谈论他们说，这是耶和华的民，是从耶和华的地出来的。
20 And wherever they went among the nations they profaned my holy name, for it was said of them, 'These are the LORD's people, and yet they had to leave his land.'

21 我却顾惜我的圣名，就是以色列家在所到的列国中所亵渎的。
21 I had concern for my holy name, which the people of Israel profaned among the nations where they had gone.

22 所以，你要对以色列家说：『主耶和华如此说：「以色列家啊，我行这事不是为你们，乃是为我的圣名，就是在你们到的列国中所亵渎的。
22 "Therefore say to the Israelites, 'This is what the Sovereign LORD says: people of Israel, that I am going to do these things, it is not for your sake, but for the sake of my holy name, which you have profaned among the nations where you have gone.

23 我要使我的大名显为圣；这名在列国中已被亵渎，就是你们在他们中间所亵渎的。我在他们眼前，在你们身上显为圣的时候，他们就知道我是耶和华。这是主耶和华说的。」
23 I will show the holiness of my great name, which has been profaned among the nations, the name you have profaned among them. Then the nations will know that I am the LORD, declares the Sovereign LORD, when I am proved holy through you before their eyes.

24 我必从各国收取你们，从列邦聚集你们，引导你们归回本地。

25 我必用清水洒在你们身上，你们就洁净了。我要洁净你们，使你们脱离一切的污秽，弃掉一切的偶像。

26 我也要赐给你们一个新心，将新灵放在你们里面，又从你们的肉体中除掉石心，赐给你们肉心。

27 我必将我的灵放在你们里面，使你们顺从我的律例，谨守遵行我的典章。

28 你们必住在我所赐给你们列祖之地。你们要作我的子民，我要作你们的神。

29 我必救你们脱离一切的污秽，也必五谷丰登，不使你们遭遇饥荒。

30 我必使树木多结果子，田地多出土产，好叫你们不再因饥荒受外邦人的讥诮。

31 那时，你们必追想你们的恶行和你们不善的作为，就因你们的罪孽和可憎的事厌恶自己。」
$scripture$),
    TRIM(BOTH E'\n' FROM $commentary$
今日经文摘要
神审判被偶像玷污的以色列家，将他们分散在列国。然而为了神圣洁的名，祂必引导以色列人回归故土，以清水洁净百姓，并赐下新灵与新心，使他们遵行律例。当他们经历神的救恩与丰盛恩典时，必深切追想并悔改自己所犯的罪。

被玷污的神的名｜36：16～20
神按人的行为施行公义的审判。以色列人之所以败亡并流离四散，乃因为他们以恶行玷污了那地（17节）。他们流人的血、事奉偶像，玷污了那地，最后招致审判而四散到列国。以色列人身处流亡之地，耶和华的圣名就因他们的境遇而被亵渎。外邦人谈论他们说：「这是耶和华的民，是从耶和华的地出来的。」（20节）此话带有讥刺意味，仿佛耶和华无力保护自己的百姓。神的百姓在世上代表神的名，理应向万民见证祂圣洁的属性。圣徒若不能活出合乎神百姓的身分，神的名便会因人的过犯而蒙受玷污。

以色列百姓住在故土时，以什么行为玷污神的名？我有哪些行为可能会使神的名蒙羞，必须弃绝？

从污秽到洁净｜36：21～31
神圣洁的名理当被万民高举。神先使以色列百姓得洁净，因为他们必须成为与耶和华所赐列祖之地相称的圣洁百姓。神要把「清水」洒在他们身上，使他们脱离一切污秽与偶像崇拜，得着全然的洁净（25节）。神更要赐给他们「一个新心」，将「新灵」放在他们里面，除掉顽固的石心，赐给他们敏锐的肉心，使他们顺服神的律例（26～27节）。如此，百姓将不再遭遇饥荒，转而享受神的丰盛福分。当恢复的恩典临到时，他们必追想自己的恶行，因罪孽与可憎之事而羞愧（31节）。神施行拯救与洁净，不是为了人的功劳，乃是因祂圣洁的名。

神洁净自己百姓的理由是什么？为了使我活出合乎圣徒身分的生活，圣灵如何在我身上动工？

今日祷告
神啊，我惧怕自己是否正在玷污祢的名。请帮助我放下不合乎百姓身分的软弱，活出洁净而信实的人生。求圣灵柔软我的心，使我全然顺服祢的话语，并借着我彰显祢就是唯一的真神。

默想散文
祂装作软弱的理由
山寨版的神
提摩太·凯勒

雅各与神摔跤，竟奇迹般地胜过祂而得着祝福。凡读到雅各这段生平的人，想必都会感到诧异与错愕。纵观雅各的一生，几乎看不到他有任何英雄事迹或高尚的表现，相反地，他始终活在被自己内心的假神与私欲捆绑的生命中。然而，圣洁至高的神为何在那夜将福分赐给他呢？

这个问题的答案，出现在圣经中的一幕：耶稣身为全能的神，却没有使用祂的能力；耶稣在黑暗略过全地的当中，为了偿付我们罪的代价，成了软弱的人。神是为了救活雅各的生命，才在黑暗中装作软弱。雅各当时拼命抓住神的原因，本是为了让自己得福；相反地，耶稣本有权可以避开十字架的痛苦，却仍然顺服以至于被钉死在十字架上，其善意是为了将福分给软弱的人。

你是否已清楚领悟，因神将自己变得软弱，才使我们能得着这样的福分？这其实是破除内心偶像崇拜的神圣良方。若不认识这样的福分，我们内在的偶像便不会从我们的生命中消失。一如当年的雅各，许多人会从我们的生命中，往各式各样荒谬的地方寻求福分，之后才发现这真正的真理之福。然而，要发现这福分的真貌，有时必须经历如跛腿一般的痛楚与软弱。经历过神祝福的人，即使身体必须拖着跛腿才能行走，也能在灵魂里欢喜跳舞。

用生活彰显
神圣洁的名
是神百姓所享有的
最大特权之一。

一节默想
以西结书36：23｜神本为至圣尊贵。即使神的名因人的罪恶而在世上被玷污，祂的用意仍是做工，使神的百姓得洁净并享受神所赐的福分；这是因着神对圣洁之名所发的热心。救恩不是出于人的功劳，而是神主动的恩典；圣徒应成为使神的名得尊贵的荣耀管道。

玷污那地（17节）：指以色列家在生活行为上犯罪，使耶和华所赐之地在祂面前成为污秽。
圣名被亵渎（20节）：以色列百姓被分散至列国，以致外邦人讥讽、误以为耶和华无力保守祂的民。
显为圣（23节）：指耶和华透过拯救行动，亲自彰显祂的圣洁、信实与能力，使列国知道并承认祂是耶和华。
清水（25节）：象征耶和华亲自洁净祂的百姓，使他们脱离污秽，并弃绝所有偶像。
新心、新灵（26节）：指耶和华更新人里面的生命，使刚硬的石心改变，成为能顺服祂的肉心。
我的灵（27节）：指神的灵内住在人里面，使人顺从祂的律例，谨守遵行祂的典章。
厌恶自己（31节）：不是自我毁灭，而是在恩典中真实悔改，为自己的罪和可憎之事自省忧伤。
全年读经 □士20 □徒24 □耶34 □诗5～6
$commentary$),
    TRIM(BOTH E'\n' FROM $hymn$
十字架的道路，殉道者的生命
求主使我心中充满主的爱，求主使我思想充满主真理，我的双眼充满泪水，因主的救恩。求主使我口中充满赞美，使我双手谦卑服事像我主，深感我的生命留下耶稣的痕迹。十字架的道路……。

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
