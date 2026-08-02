-- ============================================================
-- Flyway 迁移脚本 V27__qt_aug4.sql
-- 填充 2026-08-04（周二）灵修内容：随着嫉妒与仇恨而来的荒凉审判（以西结书 35:1~15）
-- 排版对齐 2026-08-01：
--   scripture_text：中文行 + 英文行成对（拆分原书合并节），节对之间空行分隔
--   commentary：以空行分块；散文段落拆为独立块（非塞进标题块），脚注/诗歌各为单块
--   hymn：首行为诗歌名，正文按行，末尾以「— 三一敬拜系列2《直到列国万民看见主》」标注来源
-- TRIM(BOTH E'\n' ...) 去除美元引用首尾换行，确保首行命中标题模式
-- ON CONFLICT (qt_date) DO UPDATE 保证幂等
-- ============================================================

INSERT INTO qt_daily_contents(
    id, qt_date, title, scripture_reference, scripture_text, commentary, hymn,
    title_ko, scripture_reference_ko, scripture_text_ko, commentary_ko, hymn_ko
) VALUES (
    gen_random_uuid(),
    DATE '2026-08-04',
    '随着嫉妒与仇恨而来的荒凉审判',
    '以西结书 35:1~15',
    TRIM(BOTH E'\n' FROM $scripture$
1 耶和华的话又临到我说：
1 The word of the LORD came to me:

2「人子啊，你要面向西珥山发预言，攻击他，
2 "Son of man, set your face against Mount Seir; prophesy against it

3 对他说：『主耶和华如此说：「西珥山哪，我与你为敌，必向你伸手攻击你，使你荒凉，令人惊骇。
3 and say: 'This is what the Sovereign LORD says: I am against you, Mount Seir, and I will stretch out my hand against you and make you a desolate waste.

4 我必使你的城邑变为荒场，成为凄凉。你就知道我是耶和华。
4 I will turn your towns into ruins and you will be desolate. Then you will know that I am the LORD.

5 因为你永怀仇恨，在以色列人遭灾、罪孽到了尽头的时候，将他们交与刀剑，
5 "Because you harbored an ancient hostility and delivered the Israelites over to the sword at the time of their calamity, the time their punishment reached its climax,

6 所以主耶和华说：『我指着我的永生起誓，我必使你遭遇流血的报应，罪（原文作血；本节同）必追赶你；你既不恨恶杀人流血，所以这罪必追赶你。』
6 therefore as surely as I live, declares the Sovereign LORD, I will give you over to bloodshed and it will pursue you. Since you did not hate bloodshed, bloodshed will pursue you.

7 我必使西珥山荒凉，令人惊骇，来往经过的人我必剪除。
7 I will make Mount Seir a desolate waste and cut off from it all who come and go.

8 我必使西珥山满有被杀的人。被刀杀的，必倒在你小山和山谷，并一切的溪水中。
8 I will fill your mountains with the slain; those killed by the sword will fall on your hills and in your valleys and in all your ravines.

9 我必使你永远荒凉，使你的城邑无人居住，你的民就知道我是耶和华。
9 I will make you desolate forever; your towns will not be inhabited. Then you will know that I am the LORD.

10 因为你曾说：『这二国这二邦必归于我，我必得为业（其实耶和华仍在那里）。』
10 "Because you have said, 'These two nations and countries will be ours and we will take possession of them,' even though I the LORD was there,

11 所以主耶和华说：『我指着我的永生起誓，我必照你的怒气和你从仇恨中向他们所发的嫉妒待你。我审判你的时候，必将自己显明在他们中间。
11 therefore as surely as I live, declares the Sovereign LORD, I will treat you in accordance with the anger and jealousy you showed in your hatred of them and I will make myself known among them when I judge you.

12 你也必知道我—耶和华听见了你的一切毁谤，就是你攻击以色列山的话，说：『这些山荒凉，是归我们吞灭的。』
12 Then you will know that I the LORD have heard all the contemptible things you have said against the mountains of Israel. You said, "They have been laid waste and have been given over to us to devour."

13 你们也用口向我夸大，增添与我反对的话，我都听见了。
13 You boasted against me and spoke against me without restraint, and I heard it.

14 主耶和华如此说：『全地欢乐的时候，我必使你荒凉。
14 This is what the Sovereign LORD says: While the whole earth rejoices, I will make you desolate.

15 你怎样因以色列家的地业荒凉而喜乐，我必照你所行的待你。西珥山哪，你和以东全地必都荒凉。你们就知道我是耶和华。』」
15 Because you rejoiced when the inheritance of Israel became desolate, that is how I will treat you. You will be desolate, Mount Seir, you and all of Edom. Then they will know that I am the LORD."
$scripture$),
    TRIM(BOTH E'\n' FROM $commentary$
今日经文摘要
神吩咐以西结向西珥山发预言。以东自古怀恨，在以色列人遭患难、因罪受尽刑罚时，把他们交在刀剑之下，因此他们必受审判，城邑中不再有人居住。神要使因以色列的荒凉而喜乐的以东，变为荒凉之地，使他们知道祂是耶和华。

对以东的审判宣告｜35：1～9
神向东（西珥山）宣告审判。以东是以扫的后裔；自从以扫与雅各之间长子的名分与祝福之争以来，以东长久对雅各（以色列）的后裔怀恨在心。当以色列人遭灾、因着罪受尽刑罚的时候，这积怨竟演变成将他们交与刀剑的残酷恶行（5节）。当耶和华按着以东的恶行施行报应时，那流血的罪必追赶他们（6节）。其结果是以东必沦为无人往来的荒地与废墟，充满被刀杀戮的人。对神的百姓而言，此预言显明神必除灭仇敌、施行恢复；对仇敌而言，则是审判的宣告。神必以公义报应伤害祂百姓的人。

以东为何遭受神严厉的审判？我应当放下过去哪些隐藏的敌意，以怜悯和爱对待的肢体是谁？

神听见讥诮的言语｜35：10～15
以东妄称已经遭灾的北国以色列和南国犹大皆是自己的产业。他们讥诮已成荒凉的以色列山，狂妄地宣称要将其吞灭并据为己有。以东傲慢吐出的话，耶和华都听见了（10、12～13节）。以东怎样藐视以色列并幸灾乐祸，耶和华也要照着他们的恶行报应他们。以东在耶路撒冷灭亡时欢乐，必在以色列恢复时受审判而变为荒凉（14节）。借着公义的审判，以东将明白祂羞辱以色列的所有话语，神都听见了。圣徒必须谨记，若对遭患难的弟兄说出讥诮或骄傲之言，必为神所憎恶；神必按公义来审判恶人，也会管教祂的儿女。

骄傲的以东在以色列败亡而荒凉时说了什么话？我有哪些言语或行为应该承认错误并悔改？

今日祷告
神啊，祢听见我们所有的话语并施行报应；愿祢的公义对我而言不是恐惧，而是坚固的安慰。当我遭遇仇敌讥诮或误解时，求祢使我凭信心紧握祢必报应的应许。求神引导我活出蒙祢所爱百姓的样式，依从祢的旨意说话行事。

默想散文
要警戒嫉妒与愤怒
得胜的信仰
李默熙

美国太空总署（NASA）太空人丽莎·诺瓦克，原是一位备受瞩目的优秀人才，她毕业于美国海军官校，并在海军研究所取得航太工程硕士学位。然而在2007年因深陷三角情感纠葛，涉嫌袭击并企图绑架一名女子而被判处刑责。这名被嫉妒与愤怒吞噬、因而犯罪的精英，不但被NASA解职，在海军过往累积的一切也一夕之间失去。

早期教会传统为了追求灵命成长，而严加警戒的七种致命罪中，便包含了嫉妒与愤怒。对他人的成功与成就而生的嫉妒之心，非但不会轻易消失，反而会随着时间壮大，演变成不可收拾的愤怒。我牧会事奉已逾二十年，始终坚守着一个原则，其中之一就是：「一旦动怒，便是输家。」虽然羡慕之心人皆有之，但若任由其转化为嫉妒与愤怒，那就输了。愤怒就像心灵的肺炎，是一种破坏性的情绪，甚至可能发展成恶行。

人因嫉妒与憎恨所生出的愤怒，无法成就神的义。它不仅会破坏人与人之间的关系，更会阻断人与神之间的亲密连结。在充满嫉妒与愤怒的社会里，唯有存着耶稣基督的心、以温柔来回应负面情绪的人，才能显明神的公义。制伏心中的嫉妒与愤怒，终究是一场效法主耶稣心肠的操练，更是信仰的实践。

披着邪恶本性
困走在恶的引导
相对立的路上
必落入审判……

一节默想
以西结书35：15｜圣徒应与喜乐的人同乐；与哀哭的人同哭。神不忽略嘲笑他人不幸之人的恶，并要彰显自己的义，以公义施行报应。基督徒不应以他人的失败来印证自己的行为，或藉此作为指责对方的根据。因为神以公义掌管所有历史，我们必须时常留意自己对邻舍的态度。

西珥山（2节）：原为何利人居住的山（创14：6），以扫的子孙得了那地，并在那里居住之后，成为以东人的根据地（申2：12、22；创33：16，36：8～9）。
这二国这二邦（10节）：指北国以色列和南国犹大。
全年读经 □士18 □徒22 □耶32 □诗1～2
$commentary$),
    TRIM(BOTH E'\n' FROM $hymn$
耶稣求指引我生命道路
耶稣求指引我生命道路，我要全心跟随，谦卑来到主座前，向祢献上受伤的心。我的公义盾牌和力量，祂名是耶稣，我的道路真理生命，耶稣，耶稣。唯有主知道我当行的道路，求主熬炼洁净我心……。

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
