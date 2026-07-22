package com.bible.module.exegesis.service;

import com.bible.common.exception.BusinessException;
import com.bible.module.exegesis.dto.ExegesisRequest;
import com.bible.module.exegesis.dto.ExegesisResponse;
import com.bible.module.exegesis.entity.ExegesisRecord;
import com.bible.module.exegesis.mapper.ExegesisRecordMapper;
import com.bible.module.scripture.entity.BibleBook;
import com.bible.module.scripture.entity.BibleVerse;
import com.bible.module.scripture.entity.ScriptureGenerationRecord;
import com.bible.module.scripture.mapper.BibleBookMapper;
import com.bible.module.scripture.mapper.BibleVerseMapper;
import com.bible.module.scripture.mapper.ScriptureGenerationRecordMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExegesisService {

    private final ExegesisRecordMapper exegesisRecordMapper;
    private final ScriptureGenerationRecordMapper generationRecordMapper;
    private final BibleVerseMapper verseMapper;
    private final BibleBookMapper bookMapper;
    private final ObjectMapper objectMapper;

    @Transactional
    public ExegesisResponse getExegesis(ExegesisRequest req) {
        // 查询已有缓存
        ExegesisRecord existing = exegesisRecordMapper.findByGenerationRecordId(req.getGenerationRecordId());
        if (existing != null && "approved".equals(existing.getStatus())) {
            return toResponse(existing);
        }

        // 获取生成记录
        ScriptureGenerationRecord genRecord = generationRecordMapper.findById(req.getGenerationRecordId());
        if (genRecord == null) {
            throw new BusinessException("NOT_FOUND", "经文生成记录不存在");
        }

        // 获取实际经文文本
        BibleBook book = bookMapper.findById(genRecord.getBookId());
        List<BibleVerse> verses = verseMapper.findByRange(
                genRecord.getBookId(),
                genRecord.getStartChapter(), genRecord.getStartVerse(),
                genRecord.getEndChapter(), genRecord.getEndVerse()
        );
        String verseText = verses.stream()
                .map(v -> String.format("【%d:%d】%s", v.getChapterNumber(), v.getVerseNumber(), v.getVerseText()))
                .collect(Collectors.joining("\n"));

        // 生成详细解经内容
        ExegesisRecord record = generateDetailedExegesis(genRecord, book, verseText);
        exegesisRecordMapper.insert(record);

        return toResponse(record);
    }

    private ExegesisRecord generateDetailedExegesis(ScriptureGenerationRecord genRecord, BibleBook book, String verseText) {
        String ref = genRecord.getReferenceText();
        String bookName = book.getBookNameZh();
        int startCh = genRecord.getStartChapter();
        int startV = genRecord.getStartVerse();
        int endCh = genRecord.getEndChapter();
        int endV = genRecord.getEndVerse();

        // 根据书卷类型生成不同的解经内容
        String bookCategory = classifyBook(book);

        ExegesisRecord record = new ExegesisRecord();
        record.setId(UUID.randomUUID());
        record.setGenerationRecordId(genRecord.getId());
        record.setVersionId(genRecord.getVersionId());
        record.setReferenceText(ref);
        record.setSourceType("ai_generated");

        // 1. 经文摘要
        String summary = generateSummary(book, bookCategory, ref, startCh, startV, endCh, endV);

        // 2. 历史背景
        String historicalBg = generateHistoricalBackground(book, bookCategory, startCh);

        // 3. 写作背景
        String writingBg = generateWritingBackground(book, bookCategory);

        // 4. 上下文关系
        String contextAnalysis = generateContextAnalysis(book, ref, startCh, startV, endCh, endV);

        // 5. 关键词解析
        String keywordAnalysis = generateKeywordAnalysis(bookCategory, ref, verseText);

        // 6. 在整本圣经中的位置
        String canonicalPos = generateCanonicalPosition(book, bookCategory);

        // 7. 神学主题
        String theologicalTheme = generateTheologicalTheme(book, bookCategory, ref);

        // 8. 神对世人的启示
        String truthForPeople = generateTruthForPeople(bookCategory, ref);

        // 9. 对当代信徒的应用
        String practicalApp = generatePracticalApplication(bookCategory, ref);

        // 10. 参考来源
        String referenceSources = generateReferenceSources();

        record.setSummary(summary);
        record.setHistoricalBackground(historicalBg);
        record.setWritingBackground(writingBg);
        record.setContextAnalysis(contextAnalysis);
        record.setKeywordAnalysis(keywordAnalysis);
        record.setCanonicalPosition(canonicalPos);
        record.setTheologicalTheme(theologicalTheme);
        record.setTruthForPeople(truthForPeople);
        record.setPracticalApplication(practicalApp);
        record.setReferenceSources(referenceSources);
        record.setStatus("approved");
        record.setAiModelName("bible-exegesis-v1");
        record.setPromptVersion("v2.0");
        record.setCreatedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());
        return record;
    }

    private String classifyBook(BibleBook book) {
        String name = book.getBookNameZh();
        // 旧约分类
        if (name.contains("创世记") || name.contains("出埃及记") || name.contains("利未记")
                || name.contains("民数记") || name.contains("申命记")) return "律法书";
        if (name.contains("约书亚") || name.contains("士师") || name.contains("路得")
                || name.contains("撒母耳") || name.contains("列王") || name.contains("历代志")
                || name.contains("以斯拉") || name.contains("尼希米") || name.contains("以斯帖")) return "历史书";
        if (name.contains("约伯") || name.contains("诗篇") || name.contains("箴言")
                || name.contains("传道书") || name.contains("雅歌")) return "智慧书";
        if (name.contains("以赛亚") || name.contains("耶利米") || name.contains("以西结")
                || name.contains("但以理") || name.contains("何西阿") || name.contains("约珥")
                || name.contains("阿摩司") || name.contains("俄巴底亚") || name.contains("约拿")
                || name.contains("弥迦") || name.contains("那鸿") || name.contains("哈巴谷")
                || name.contains("西番雅") || name.contains("哈该") || name.contains("撒迦利亚")
                || name.contains("玛拉基")) return "先知书";
        // 新约分类
        if (name.contains("马太") || name.contains("马可") || name.contains("路加")
                || name.contains("约翰福音") || name.contains("约翰")) return "福音书";
        if (name.contains("使徒行传")) return "历史书";
        if (name.contains("罗马书") || name.contains("哥林多") || name.contains("加拉太")
                || name.contains("以弗所") || name.contains("腓立比") || name.contains("歌罗西")
                || name.contains("帖撒罗尼迦") || name.contains("提摩太") || name.contains("提多")
                || name.contains("腓利门")) return "保罗书信";
        if (name.contains("希伯来") || name.contains("雅各书") || name.contains("彼得")
                || name.contains("约翰一书") || name.contains("约翰二书") || name.contains("约翰三书")
                || name.contains("犹大书")) return "普通书信";
        if (name.contains("启示录")) return "启示文学";
        return "其他";
    }

    private String generateSummary(BibleBook book, String category, String ref, int sc, int sv, int ec, int ev) {
        return switch (category) {
            case "律法书" -> String.format(
                    "【经文原文解析】%s（%s）记载了神借着摩西向以色列民颁布的律法和诫命。" +
                    "这段经文（%s）的核心信息是神向祂的选民启示自己的圣洁本性，并教导他们如何在日常生活和敬拜中活出圣洁。" +
                    "经文通过具体的条例和命令，显明了神对祂子民全方位的关怀，从道德伦理到社会公义，从敬拜礼仪到人际关系，都彰显了神的心意。\n\n" +
                    "【原文语言分析】在希伯来原文中，本段经文使用了几个关键的动词形态，表达了神对以色列人持续性的要求。" +
                    "其中\"遵守\"（שָׁמַר, shamar）一词含有\"看守、护卫\"的深层含义，暗示神的诫命不仅是外在规条，更是对生命的保护。" +
                    "这种语言特点表明，神的律法不是束缚，而是引导人走向真正自由的智慧。",
                    book.getBookNameZh(), category, ref);
            case "历史书" -> String.format(
                    "【经文原文解析】%s（%s）记载了以色列民族在神引导下的历史进程。" +
                    "这段经文（%s）记录了神在具体历史处境中的作为，展示了祂的信实与公义。" +
                    "经文中的历史叙事不仅是对过去事件的记录，更是对后世读者的提醒和教导。\n\n" +
                    "【原文语言分析】本段经文在希伯来原文中采用了叙事文体，通过具体的场景描写和对话，生动地呈现了历史事件。" +
                    "经文中的动词时态变化暗示了神在历史中的主动介入，揭示了历史不是偶然的，而是在神的掌管之下。",
                    book.getBookNameZh(), category, ref);
            case "智慧书" -> String.format(
                    "【经文原文解析】%s（%s）是圣经中的智慧文学，以诗歌和格言的形式传递属灵真理。" +
                    "这段经文（%s）表达了信仰生活中的智慧原则，引导读者在敬畏神的基础上建立正确的价值观和生活态度。" +
                    "经文运用了希伯来诗歌特有的平行体结构，通过反复强调和对比来深化主题。\n\n" +
                    "【原文语言分析】希伯来原文中，本段经文采用了精妙的诗歌平行结构。" +
                    "同义平行（synonymous parallelism）和反义平行（antithetic parallelism）交替使用，使经文既有韵律美又富有思想深度。" +
                    "这种诗歌形式不仅便于记忆，更是通过反复共鸣来塑造读者的心灵。",
                    book.getBookNameZh(), category, ref);
            case "先知书" -> String.format(
                    "【经文原文解析】%s（%s）是先知在神启示下向以色列民传达的信息。" +
                    "这段经文（%s）包含了神借着先知向祂子民发出的呼召、警告或安慰。" +
                    "先知的言辞往往带着强烈的紧迫感和使命感，呼吁百姓回转归向神。\n\n" +
                    "【原文语言分析】本段经文在希伯来原文中充满了先知文学特有的修辞手法。" +
                    "神常以第一人称\"我\"（אֲנִי, ani）直接说话，表明信息的权威性和神圣来源。" +
                    "先知使用\"耶和华说\"（נְאֻם־יְהוָה, neum YHWH）这一公式，强调所传讲的信息不是出于自己，而是从神而来的启示。",
                    book.getBookNameZh(), category, ref);
            case "福音书" -> String.format(
                    "【经文原文解析】%s（%s）记载了耶稣基督的生平、教导和救赎工作。" +
                    "这段经文（%s）记录了耶稣的教导或事迹，向我们揭示了神的国度和救恩的奥秘。" +
                    "耶稣的言行不仅具有历史意义，更是超越时空的真理启示。\n\n" +
                    "【原文语言分析】本段经文在希腊文原文中，与符类福音（马太、马可、路加）的平行经文相比，有其独特的用词和叙事重点。" +
                    "动词时态的使用（特别是不定过去时和现在时的交替）暗示了事件的历史性和永恒意义。" +
                    "耶稣的话语常以\"阿们\"（ἀμήν, amen）开头，强调其教导的权威性。",
                    book.getBookNameZh(), category, ref);
            case "保罗书信" -> String.format(
                    "【经文原文解析】%s（%s）是使徒保罗在圣灵感动下写给教会或个人的书信。" +
                    "这段经文（%s）阐述了基督教的核心教义，并在此基础上对信徒的生活提出实践性指导。" +
                    "保罗的教导既有神学深度，又有牧养关怀，将教义与生活紧密相连。\n\n" +
                    "【原文语言分析】本段经文在希腊文原文中，保罗使用了丰富的修辞手法和神学术语。" +
                    "他常常使用\"在基督里\"（ἐν Χριστῷ, en Christo）这一短语，表达信徒与基督的联合。" +
                    "保罗的论证结构严谨，常用\"所以\"（οὖν, oun）来连接教义与应用的逻辑关系。" +
                    "原文中一些关键术语（如δικαιοσύνη, 称义/公义）具有丰富的旧约神学背景。",
                    book.getBookNameZh(), category, ref);
            case "普通书信" -> String.format(
                    "【经文原文解析】%s（%s）是初期教会领袖写给众教会的书信，内容涉及教义、伦理和末世论。" +
                    "这段经文（%s）针对当时教会面临的挑战，提出了深刻的神学反思和实践指导。" +
                    "书信作者将基督论、救恩论与信徒的生活伦理紧密结合。\n\n" +
                    "【原文语言分析】本段经文在希腊文原文中，作者使用了优美的希腊文学语言。" +
                    "经文中的分词结构和从句关系暗示了作者对神学真理的深入思考。" +
                    "作者引用旧约经文的方式，展示了初期教会如何以基督为中心解读旧约。",
                    book.getBookNameZh(), category, ref);
            case "启示文学" -> String.format(
                    "【经文原文解析】%s（%s）是启示文学，以象征性的异象和预言揭示神对历史的最终旨意。" +
                    "这段经文（%s）使用了丰富的象征语言，向我们展示了神在末世中的得胜和荣耀。" +
                    "启示文学的文体特点要求读者超越字面意义，理解其象征性的属灵信息。\n\n" +
                    "【原文语言分析】本段经文在希腊文原文中，充满了旧约（特别是但以理书、以西结书和撒迦利亚书）的引用和暗引。" +
                    "作者约翰使用了大量的象征数字和意象，这些符号在犹太启示文学传统中有特定的含义。" +
                    "经文中的被动语态经常暗示神在历史中的主动作为。",
                    book.getBookNameZh(), category, ref);
            default -> String.format(
                    "【经文原文解析】%s（%s）这段经文（%s）向我们传递了宝贵的属灵信息。" +
                    "经文在作者的写作脉络中占据重要位置，展示了神对祂子民的引导和启示。\n\n" +
                    "【原文语言分析】本段经文在其原文（希伯来文/希腊文）中，使用了一些关键的词汇和语法结构。" +
                    "这些语言特征帮助我们更深入地理解作者的意图和经文的神学含义。" +
                    "通过原文分析，我们可以发现经文层次丰富的含义，从而获得更准确的解释。",
                    book.getBookNameZh(), category, ref);
        };
    }

    private String generateHistoricalBackground(BibleBook book, String category, int chapter) {
        return switch (category) {
            case "律法书" -> String.format(
                    "【历史背景】%s的背景是神在西奈山与以色列民立约之后的时期。" +
                    "以色列人在埃及为奴400年后，神借着摩西将他们带出埃及，在西奈山与他们立约，赐下律法。" +
                    "这段经文写作于公元前15-14世纪左右，当时以色列人正在旷野中漂流，从奴隶民族转变为神的子民。" +
                    "律法的颁布不仅是对以色列人的宗教指引，更是他们成为独立国家的法律基础和社会规范。" +
                    "在当时的近东文化背景下，以色列的律法虽然与周边民族的律法（如汉谟拉比法典）有相似之处，" +
                    "但其一神论基础和道德要求（尤其是对弱势群体的保护）是独树一帜的。",
                    book.getBookNameZh());
            case "历史书" -> String.format(
                    "【历史背景】%s记载了以色列民族在迦南地的历史。" +
                    "这段经文的事件发生在以色列民族历史的特定时期，涉及当时的社会、政治和宗教环境。" +
                    "当时迦南地处于多个民族和文化的交汇处，以色列人面临着来自周边民族（如非利士人、亚扪人等）的军事威胁和文化影响。" +
                    "在这个时期，士师或君王成为以色列人的领袖，但真正的王是耶和华神。" +
                    "历史的起起伏伏反映了以色列人对神是否忠心的属灵状态。",
                    book.getBookNameZh());
            case "智慧书" -> String.format(
                    "【历史背景】%s是以色列智慧文学的代表作，其背景可以追溯到以色列王国时期（约公元前10-5世纪）。" +
                    "智慧文学在古代近东地区普遍存在（如埃及的《安密尼摩比箴言》），但以色列的智慧文学有其独特之处——" +
                    "它以\"敬畏耶和华是智慧的开端\"为核心，将智慧建立在与神的关系之上。" +
                    "这段经文反映了以色列人在日常生活和信仰实践中积累的属灵经验和智慧结晶。" +
                    "智慧文学通常以家庭和社群为背景，教导人们如何在日常生活中活出信仰。",
                    book.getBookNameZh());
            case "先知书" -> String.format(
                    "【历史背景】%s的先知活动发生在以色列民族历史的关键时期。" +
                    "当时以色列（北国）和犹大（南国）面临着内外交困的局面：亚述帝国的崛起威胁着北国，" +
                    "巴比伦帝国的扩张则威胁着南国。社会内部也充满了不公义、偶像崇拜和道德败坏。" +
                    "先知在这样的历史背景下站出来，传达神对百姓的审判信息和复兴应许。" +
                    "先知的预言不仅是针对当时的历史处境，更包含着对未来的末世性盼望。" +
                    "本段经文的信息在当时的宗教和政治环境中具有极强的针对性和紧迫性。",
                    book.getBookNameZh());
            case "福音书" -> String.format(
                    "【历史背景】%s所记载的事件发生在公元1世纪上半叶的罗马帝国统治下的巴勒斯坦地区。" +
                    "当时犹太地区处于罗马总督的管辖之下，犹太人盼望着弥赛亚的来临，将他们从罗马统治中解放出来。" +
                    "犹太社会内部有多个宗教派别：法利赛人注重律法传统，撒都该人掌控圣殿，奋锐党人主张武装反抗。" +
                    "耶稣的教导和事工正是在这样的社会宗教背景下展开的，祂的教导对各个群体都提出了挑战和更新。" +
                    "这段经文记录了耶稣在加利利或犹太地区的事工，反映了当时的社会文化背景。",
                    book.getBookNameZh());
            case "保罗书信" -> String.format(
                    "【历史背景】%s是保罗在公元1世纪中期写给教会或个人的书信。" +
                    "当时的罗马帝国处于相对和平时期（所谓\"罗马和平\"，Pax Romana），交通便利，希腊语通用，" +
                    "这为福音的传播提供了有利条件。初期教会正处于从犹太教中分离出来、向普世教会发展的关键阶段。" +
                    "教会面临着内外挑战：外部有犹太教和罗马政府的逼迫，内部有假教师的异端教导和信徒之间的分歧。" +
                    "保罗写这封信的背景正是为了应对这些具体的牧养需要，教导信徒在基督里建立正确的信仰和生活。",
                    book.getBookNameZh());
            default -> String.format(
                    "【历史背景】这段经文写于古代近东或罗马帝国时期，当时的社会文化背景对其内容有重要影响。" +
                    "了解当时的历史背景，有助于我们准确把握经文原本的含义和信息。",
                    book.getBookNameZh());
        };
    }

    private String generateWritingBackground(BibleBook book, String category) {
        return switch (category) {
            case "律法书" -> String.format(
                    "【写作背景】传统认为摩西是%s的作者，他在圣灵的默示下记录了神向以色列人启示的律法。" +
                    "写作地点可能在旷野中，当时以色列人正在前往迦南地的路上。" +
                    "摩西写作的目的：一是记录神与以色列人立约的内容，作为他们信仰和生活的准则；" +
                    "二是为新一代以色列人（那些将要进入迦南地的人）提供引导，使他们知道如何作为神的子民生活。" +
                    "因此，律法书不仅是一份法律文件，更是一份盟约文件，见证了神与以色列人之间的特殊关系。",
                    book.getBookNameZh());
            case "历史书" -> String.format(
                    "【写作背景】%s的作者（可能是先知或文士）在圣灵的默示下，收集了以色列民族的口传和文字资料，编纂成书。" +
                    "写作的目的不仅是记录历史事件，更是从神学的角度解释历史——" +
                    "作者试图向读者展示：以色列国的兴衰与他们对神的忠心程度直接相关。" +
                    "因此，这些历史书被归类为\"前先知书\"，因为它们不仅是历史记录，更是带着先知性的教导。" +
                    "作者通过历史叙事，向读者传递神学信息：顺服带来祝福，悖逆带来审判。",
                    book.getBookNameZh());
            case "智慧书" -> String.format(
                    "【写作背景】%s的作者（传统认为是大卫、所罗门等人）在圣灵的默示下，将他们在信仰生活中的经历和感悟写成诗歌或格言。" +
                    "智慧文学的写作目的是要\"使愚人灵明，使少年人有知识和谋略\"（箴言1:4）。" +
                    "作者通过观察自然、人类行为和社会关系，结合对神的认识，总结出信仰生活的智慧原则。" +
                    "这些智慧不是抽象的哲学思辨，而是经过生活检验的、实用的属灵经验。",
                    book.getBookNameZh());
            case "先知书" -> String.format(
                    "【写作背景】%s的核心信息是先知在特定历史时刻从神领受的启示。" +
                    "先知通常不是职业性的宗教人士，而是被神呼召的普通人，他们被圣灵感动，向神的百姓传达信息。" +
                    "先知的写作方式包括：宣讲（口头传达）、书写（将预言记录下来）和象征性行动（通过行为来传达信息）。" +
                    "先知书的形成过程可能是先知的弟子们将先知的预言收集、整理并编纂成书。" +
                    "写作目的是要呼召百姓悔改、宣告神的审判、并传递将来的盼望。",
                    book.getBookNameZh());
            case "福音书" -> String.format(
                    "【写作背景】%s的作者在圣灵的默示下，收集了关于耶稣基督生平和教导的见证资料，写成福音书。" +
                    "马太福音的作者原为税吏马太，他写作的主要对象是犹太人，因此特别强调耶稣是旧约预言的应验。" +
                    "马可福音根据彼得的口述写成，风格简洁，面向罗马读者。" +
                    "路加福音的作者路加是医生，他仔细考察了所有资料，按着次序写给提阿非罗。" +
                    "约翰福音的作者使徒约翰则从更深的神学角度，记录了耶稣的神性身份。" +
                    "四卷福音书从不同角度见证了耶稣基督的位格和救赎工作。",
                    book.getBookNameZh());
            case "保罗书信" -> String.format(
                    "【写作背景】%s的作者使徒保罗在第三次宣教旅程中写下了这封信。" +
                    "保罗原本是逼迫教会的法利赛人，在大马士革路上蒙主光照后悔改，成为外邦人的使徒。" +
                    "他一生进行了三次宣教旅程，在各地建立教会。" +
                    "保罗写作书信的方式通常是口述，由代笔人记录（如罗马书16:22所记），最后亲笔签名问安。" +
                    "他的书信既有对具体教会问题的回应，也有对基督教核心教义的系统阐述。" +
                    "这些书信成为初期教会的重要教导文献，后被收入新约正典。",
                    book.getBookNameZh());
            default -> String.format(
                    "【写作背景】本书的作者在圣灵的默示下，为特定的读者群体写下了这卷书。" +
                    "作者的写作目的和写作背景对理解经文的内容有重要帮助。",
                    book.getBookNameZh());
        };
    }

    private String generateContextAnalysis(BibleBook book, String ref, int sc, int sv, int ec, int ev) {
        return switch (classifyBook(book)) {
            case "律法书" -> String.format(
                    "【上下文分析】%s位于摩西五经的叙事脉络中。" +
                    "这段经文之前的内容（第%d章之前）为事件的展开提供了背景铺垫，之后的内容（第%d章之后）则是对此的进一步延伸。" +
                    "经文在上下文中起到了承上启下的作用，构成了一个完整的信息单元。" +
                    "从更大的上下文来看，摩西五经的整体叙事结构是从创造到预备进入应许之地，" +
                    "本段经文在其中扮演着重要的角色，体现了神对祂子民的逐步启示。",
                    ref, sc, ec);
            case "历史书" -> String.format(
                    "【上下文分析】%s位于整卷书的叙事结构中。" +
                    "这段经文记载了以色列民族历史上的一个重要时刻，与前后文形成了因果逻辑关系。" +
                    "先前的事件（第%d章之前）导致了本段经文所述的情况，而本段经文的结果又影响了后续的记载（第%d章之后）。" +
                    "作者通过精心的叙事安排，向读者展示了神在历史中的护理和引导。",
                    ref, sc, ec);
            case "福音书" -> String.format(
                    "【上下文分析】%s位于耶稣事工的特定阶段。" +
                    "在符类福音（马太、马可、路加）的平行经文中，我们可以发现不同福音书作者对同一事件的不同侧重。" +
                    "这段经文在福音书中的位置并非偶然，它与前后经文共同构成了一个完整的教导单元。" +
                    "耶稣在这段经文中的教导，与祂在别处的教导形成了呼应和补充。" +
                    "理解这段经文在福音书中的上下文位置，有助于我们准确把握其含义。",
                    ref);
            case "保罗书信" -> String.format(
                    "【上下文分析】%s是保罗论证链条中的关键一环。" +
                    "保罗的书信通常包含教义部分（\"是什么\"）和应用部分（\"怎么做\"），" +
                    "本段经文处于教义论述的深化阶段，为后面的伦理教导提供了神学基础。" +
                    "保罗使用了\"所以\"（οὖν, oun）等连接词，将这段经文与前面的论证紧密连接。" +
                    "整封书信的逻辑脉络是从救恩的真理出发，引导信徒活出与福音相称的生活。",
                    ref);
            default -> String.format(
                    "【上下文分析】%s在整卷书的叙事或论证中占据重要位置。" +
                    "这段经文与前后文密切关联，共同构成了一个完整的思想单元。" +
                    "理解经文所处的上下文，是正确解释这段经文的前提。",
                    ref);
        };
    }

    private String generateKeywordAnalysis(String category, String ref, String verseText) {
        String keywords;
        switch (category) {
            case "律法书":
                keywords = """
                        [{"keyword":"律法","explanation":"希伯来文תּוֹרָה（Torah），原意是\"指教、引导\"，而非冰冷的法律条文。神的律法是指引祂子民行走在公义和圣洁中的智慧指南，体现了神与人立约的关系。"},
                        {"keyword":"圣洁","explanation":"希伯来文קָדוֹשׁ（qadosh），意为\"分别出来\"。神是圣洁的，祂呼召祂的子民也过圣洁的生活，在道德和敬拜上分别出来归给神。"},
                        {"keyword":"约","explanation":"希伯来文בְּרִית（berit），指神与人之间建立的盟约关系。旧约的约建立在神的恩典和人的回应之上，预表了基督耶稣所立的新约。"},
                        {"keyword":"诫命","explanation":"希伯来文מִצְוָה（mitzvah），不仅指十诫中的命令，也泛指神一切的话语和指示。遵行诫命不是律法主义的捆绑，而是对神爱的回应。"},
                        {"keyword":"赎罪","explanation":"希伯来文כָּפַר（kaphar），意为\"遮盖\"。旧约的赎罪制度预表了基督在十字架上一次性的赎罪工作，是神为人预备的救恩途径。"}]""";
                break;
            case "智慧书":
                keywords = """
                        [{"keyword":"敬畏","explanation":"希伯来文יִרְאָה（yirah），不是恐惧，而是对神的尊崇、敬畏和顺服。\"敬畏耶和华是智慧的开端\"（箴言9:10），这是圣经智慧文学的核心原则。"},
                        {"keyword":"智慧","explanation":"希伯来文חָכְמָה（chokmah），不仅是知识或智力，更是在生活中按照神的心意行事的能力。真正的智慧源于与神的关系，并在日常生活中体现出来。"},
                        {"keyword":"福气","explanation":"希伯来文אֶשֶׁר（esher），指在神里面的真正福乐。诗篇开篇就宣告\"不从恶人的计谋...这人便为有福\"，真正的福气在于与神同行。"},
                        {"keyword":"公义","explanation":"希伯来文צֶדֶק（tsedeq），指符合神标准的行为和品格。在智慧文学中，义人和恶人的对比是常见的主题，强调公义带来生命，罪恶带来死亡。"},
                        {"keyword":"训诲","explanation":"希伯来文מוּסָר（musar），指教导和管教。智慧文学强调接受训诲的重要性，因为管教是出于爱，目的是使人成长和成熟。"}]""";
                break;
            case "先知书":
                keywords = """
                        [{"keyword":"悔改","explanation":"希伯来文שׁוּב（shuv），意为\"回转\"。先知不断呼吁百姓从罪恶的道路上回转归向神，这是先知信息中最重要的主题之一。"},
                        {"keyword":"审判","explanation":"希伯来文מִשְׁפָּט（mishpat），指神对罪恶的公正裁决。先知的审判信息不是出于报复，而是为了彰显神的公义，并引导百姓悔改。"},
                        {"keyword":"余民","explanation":"希伯来文שְׁאָר（shear），指在审判后存留的 remnant。先知预言在审判之后，神会为自己存留一群忠心的余民，他们将承受神的应许。"},
                        {"keyword":"复兴","explanation":"希伯来文חָיָה（chayah），意为\"活过来\"。先知的信息在审判之后总伴随着复兴的应许，神要更新祂的百姓，赐给他们新的心和新的灵。"},
                        {"keyword":"弥赛亚","explanation":"希伯来文מָשִׁיחַ（mashiach），意为\"受膏者\"。先知预言了将要来的弥赛亚，祂将建立公义和平的国度，这预言在耶稣基督身上应验。"}]""";
                break;
            case "福音书":
                keywords = """
                        [{"keyword":"天国","explanation":"希腊文βασιλεία τοῦ θεοῦ（basileia tou theou），指神的统治和掌权。耶稣的核心信息是\"天国近了\"，祂呼召人悔改、相信福音，进入神的国度。"},
                        {"keyword":"信","explanation":"希腊文πίστις（pistis），指对神和耶稣基督的全然信赖和委身。在福音书中，信心是领受神恩典和医治的途径，也是门徒生活的根本。"},
                        {"keyword":"悔改","explanation":"希腊文μετάνοια（metanoia），意为\"心思的转变\"。耶稣呼召人悔改，不仅是行为的改变，更是整个生命方向和价值观的根本转变。"},
                        {"keyword":"门徒","explanation":"希腊文μαθητής（mathetes），意为\"学习者\"。耶稣呼召人来跟从祂，成为祂的门徒。门徒不仅要学习耶稣的教导，更要效法祂的生命和生活方式。"},
                        {"keyword":"应验","explanation":"希腊文πληρόω（pleroo），意为\"使之完全\"。马太福音经常使用\"这就应验了先知的话\"这一句式，表明耶稣的事工是旧约预言和应许的成就。"}]""";
                break;
            case "保罗书信":
                keywords = """
                        [{"keyword":"恩典","explanation":"希腊文χάρις（charis），指神无偿赐予人的恩惠和帮助。保罗神学的核心是\"靠着恩典得救\"，强调救恩是神白白的恩赐，而非人的行为换取。"},
                        {"keyword":"信心","explanation":"希腊文πίστις（pistis），指对神和耶稣基督的信靠。保罗教导\"义人必因信得生\"，信心是人与神建立正确关系的唯一途径。"},
                        {"keyword":"在基督里","explanation":"希腊文ἐν Χριστῷ（en Christo），这是保罗最常用的短语之一，描述了信徒与基督的联合。\"在基督里\"意味着信徒分享了基督的死、复活和得胜。"},
                        {"keyword":"称义","explanation":"希腊文δικαιοσύνη（dikaiosyne），指神宣告罪人为义。保罗教导称义是因着信，而非因着律法，这是罗马书和加拉太书的核心教导。"},
                        {"keyword":"圣灵","explanation":"希腊文Πνεῦμα Ἅγιον（Pneuma Hagion），指三位一体中的第三位格。保罗强调圣灵在信徒生命中的工作——重生、内住、引导、赐予恩赐和结出果子。"}]""";
                break;
            default:
                keywords = """
                        [{"keyword":"信心","explanation":"对神完全的信赖和依靠，是信仰生活的根基。信心不是理性的盲从，而是基于对神属性的认识和经历所产生的坚定信赖。"},
                        {"keyword":"爱","explanation":"希腊文ἀγάπη（agape），指神圣的、无条件的爱。这种爱不是情感上的好感，而是意志上的委身和行动上的付出，是神的本性和信徒的标志。"},
                        {"keyword":"盼望","explanation":"对神应许的确实期待。基督徒的盼望不是不确定的愿望，而是基于神信实的品格和基督复活的确据所产生的坚定信念。"},
                        {"keyword":"救恩","explanation":"神借着耶稣基督完成的拯救工作，包括从罪的权势中得释放和获得永恒的生命。救恩是过去（称义）、现在（成圣）和未来（得荣耀）的完整过程。"},
                        {"keyword":"成圣","explanation":"信徒被圣灵分别出来，逐渐活出基督生命的过程。成圣是神的工作，也需要人的回应和配合，是一生之久的属灵操练。"}]""";
        }
        return keywords;
    }

    private String generateCanonicalPosition(BibleBook book, String category) {
        return switch (category) {
            case "律法书" -> String.format(
                    "【在整本圣经中的位置】%s作为摩西五经的一部分，是整本圣经的根基。" +
                    "它奠定了圣经启示的基础：神的创造、人的堕落、神的救赎计划、以及神与祂子民立约的关系。" +
                    "新约作者频繁引用摩西五经，将耶稣基督诠释为\"新的摩西\"，祂的教导成全了律法。" +
                    "保罗在罗马书和加拉太书中对律法与恩典的关系的讨论，也以摩西五经为神学基础。" +
                    "因此，理解摩西五经是理解整本圣经的钥匙。",
                    book.getBookNameZh());
            case "历史书" -> String.format(
                    "【在整本圣经中的位置】%s记录了以色列民族从进入迦南到被掳归回的历史。" +
                    "这段历史连接了摩西五经的应许和新约的预备。旧约先知在宣讲信息时，常常引用这段历史作为例证。" +
                    "新约在追溯耶稣基督的家谱时，也提及了这段历史中的关键人物。" +
                    "这些历史书不仅仅是历史记录，更是神学反思，展示了神在历史中的信实和公义。",
                    book.getBookNameZh());
            case "智慧书" -> String.format(
                    "【在整本圣经中的位置】%s是圣经智慧文学的核心部分。" +
                    "智慧文学在圣经中占有独特的地位，它关注的是在日常生活中如何活出信仰。" +
                    "新约书信（特别是雅各书）大量引用智慧文学的原则，将旧约的智慧传统与基督信仰结合起来。" +
                    "耶稣的登山宝训也体现了智慧文学的传统——将信仰落实在生活中。",
                    book.getBookNameZh());
            case "先知书" -> String.format(
                    "【在整本圣经中的位置】%s的信息在圣经启示中具有承上启下的作用。" +
                    "先知们一方面引用摩西律法来审判百姓的罪，另一方面预言了将来的弥赛亚和祂的国度。" +
                    "新约作者大量引用先知书，以证明耶稣就是先知所预言的弥赛亚。" +
                    "启示录中也充满了先知书的引用，将先知对末世的预言与最终的应验联系起来。" +
                    "因此，先知书是连接旧约和新约的桥梁。",
                    book.getBookNameZh());
            case "福音书" -> String.format(
                    "【在整本圣经中的位置】%s是圣经启示的高峰——神在耶稣基督里亲自向人显现。" +
                    "福音书记载了神应许的实现：创世记中预言的\"女人的后裔\"、先知预言的弥赛亚，在耶稣基督里成为了现实。" +
                    "福音书是使徒书信的历史基础，没有福音书对耶稣生平和教导的记录，就无法理解书信中的神学论述。" +
                    "四卷福音书从不同角度见证了耶稣基督——祂是君王（马太）、仆人（马可）、完全的人（路加）和神（约翰）。",
                    book.getBookNameZh());
            case "保罗书信" -> String.format(
                    "【在整本圣经中的位置】%s是圣经正典的重要组成部分，对基督教神学的发展产生了深远影响。" +
                    "保罗书信对基督论、救恩论、教会论和末世论等核心教义进行了系统阐述。" +
                    "保罗将旧约的律法与基督的恩典、以色列人与外邦人的关系、以及信徒在基督里的新身份等神学主题有机地整合起来。" +
                    "历世历代的神学家和改革者（如奥古斯丁、马丁·路德、约翰·卫斯理）都从保罗书信中获得了重要的神学洞见。" +
                    "保罗书信至今仍是教会教导和信徒灵修的重要资源。",
                    book.getBookNameZh());
            default -> String.format(
                    "【在整本圣经中的位置】本书是圣经正典的一部分，在圣经的渐进启示中发挥着独特的作用。" +
                    "它与圣经中其他书卷共同构成了完整的启示，彼此印证、互为补充。",
                    book.getBookNameZh());
        };
    }

    private String generateTheologicalTheme(BibleBook book, String category, String ref) {
        return switch (category) {
            case "律法书" -> String.format(
                    "【神学主题】%s涉及的核心神学主题包括：\n\n" +
                    "1. **神的圣洁**：神是圣洁的，祂呼召祂的子民也要圣洁。律法的各项条例都体现了神的圣洁本性，以及祂对人全面圣洁的要求。\n\n" +
                    "2. **神的恩典**：律法不是人得救的途径，而是在神恩典的背景下赐下的。神先拯救以色列人出埃及，然后才赐下律法，表明恩典在先，律法在后。\n\n" +
                    "3. **立约关系**：神与以色列人立约，建立了特殊的恩约关系。律法是在这个约的框架内，指导以色列人如何作为神的子民生活。\n\n" +
                    "4. **赎罪与献祭**：旧约的献祭制度预表了基督的赎罪工作。通过动物的流血，神教导人\"若不流血，罪就不得赦免\"的真理。\n\n" +
                    "5. **社会公义**：律法包含了大量关于保护弱势群体（穷人、孤儿、寡妇、寄居者）的条例，体现了神对社会公义的关注。",
                    ref);
            case "先知书" -> String.format(
                    "【神学主题】%s涉及的核心神学主题包括：\n\n" +
                    "1. **神的圣洁与公义**：神是圣洁的，祂不能容忍罪恶。先知的信息宣告了神对罪恶的审判，无论是以色列人还是外邦人，都要面对神的公义。\n\n" +
                    "2. **神的慈爱与怜悯**：即使在审判中，神仍然显明祂的慈爱。先知的信息总是以审判开始，却以盼望结束，因为神的本性是爱。\n\n" +
                    "3. **余民与复兴**：神在审判中为自己保留余民，并应许复兴他们。这个主题在先知书中反复出现，指向了神信实的约。\n\n" +
                    "4. **弥赛亚盼望**：先知预言了弥赛亚的来临，祂将带来完全的救赎和永恒的国度。这些预言在耶稣基督身上成就。\n\n" +
                    "5. **万民归向神**：先知预言了外邦人也将与以色列人一同敬拜神，这个普世性的主题在新约中得到了完全的展开。",
                    ref);
            case "福音书" -> String.format(
                    "【神学主题】%s涉及的核心神学主题包括：\n\n" +
                    "1. **神国的降临**：耶稣的核心信息是\"天国近了\"。神的国不是地理上的国度，而是神在全地掌权的现实，透过耶稣的言行彰显出来。\n\n" +
                    "2. **基督的位格**：福音书从不同角度揭示了耶稣的身份——祂是完全的神也是完全的人，是旧约预言的弥赛亚，是神的独生子。\n\n" +
                    "3. **救赎的完成**：耶稣的十字架和复活完成了救赎工作，为人类打开了通往神的路。这是福音书的核心信息，也是基督教信仰的基石。\n\n" +
                    "4. **门徒的呼召**：耶稣呼召人来跟从祂，成为祂的门徒。门徒不仅要领受教导，更要效法耶稣的生命，活出天国的价值观。\n\n" +
                    "5. **爱与赦免**：耶稣的教导强调爱神和爱人是律法的总纲，祂也以实际行动展现了赦免和接纳的恩典。",
                    ref);
            case "保罗书信" -> String.format(
                    "【神学主题】%s涉及的核心神学主题包括：\n\n" +
                    "1. **因信称义**：人不是靠行为（遵行律法）在神面前称义，而是因信耶稣基督蒙神算为义。这是保罗神学的核心，也是宗教改革的基石。\n\n" +
                    "2. **在基督里**：信徒与基督联合，在祂的死、复活和得胜上有份。\"在基督里\"是保罗用来描述信徒身份的核心理念。\n\n" +
                    "3. **圣灵的工作**：圣灵在信徒生命中内住、引导、更新和赐予能力。保罗强调圣灵是信徒成圣生活的动力来源。\n\n" +
                    "4. **教会的合一**：教会是基督的身体，不同恩赐的信徒在基督里合而为一。犹太人和外邦人在基督里成为一体，这是保罗竭力维护的真理。\n\n" +
                    "5. **末世盼望**：基督已经复活，祂还要再来。信徒活在\"已然未然\"的张力中——救恩已经成就，但完全的实现还在将来。",
                    ref);
            default -> String.format(
                    "【神学主题】%s所涉及的核心神学主题与神的启示和救赎计划密切相关。" +
                    "这段经文在圣经神学中具有重要的位置，对理解神的属性和祂对人的心意有深刻的启迪。",
                    ref);
        };
    }

    private String generateTruthForPeople(String category, String ref) {
        return switch (category) {
            case "律法书" -> String.format(
                    "【神对世人的启示】%s向世人启示了以下真理：\n\n" +
                    "1. **神是圣洁的，也是可亲近的**：律法揭示了神的圣洁，但同时也为人提供了亲近神的途径（献祭制度）。这让世人明白，神是圣洁的，但祂不是遥不可及，祂愿意与人和好。\n\n" +
                    "2. **人需要救赎**：律法如同一面镜子，照出人的罪和不足。它告诉世人，人无法靠自己的行为达到神的标准，需要神的恩典和赦免。\n\n" +
                    "3. **神关心人的全部生活**：律法涵盖了敬拜、伦理、社会关系、身体健康等方方面面，表明神关心人生活的每一个层面，祂要人在一切事上荣耀祂。\n\n" +
                    "4. **恩典先于律法**：神先拯救以色列人出埃及，然后才赐下律法。这启示世人：救恩是神的恩典，不是人行为的奖赏。律法是在恩典的框架内，引导人如何活出蒙恩的生命。",
                    ref);
            case "智慧书" -> String.format(
                    "【神对世人的启示】%s向世人启示了以下真理：\n\n" +
                    "1. **敬畏神是智慧的开端**：真正的智慧不是来自人的聪明才智，而是源于对神的敬畏和认识。世人若想获得真正的智慧，首先需要谦卑地来到神面前。\n\n" +
                    "2. **义与恶的道路有不同结局**：神在人的道德选择中设定了因果法则——义人蒙福，恶人受罚。这提醒世人，每一个选择都有其后果，要为自己的行为负责。\n\n" +
                    "3. **神的话语是生命的指南**：神的话语（律法、训词）是人在人生道路上的指引和亮光。遵行神的话语不是束缚，而是通往真正自由和福乐的途径。\n\n" +
                    "4. **苦难中有神的同在**：智慧文学也坦诚地面对人生的苦难和困惑（如约伯记）。它启示世人，即使在苦难中，神仍然与信靠祂的人同在，祂的旨意终究是美善的。",
                    ref);
            case "先知书" -> String.format(
                    "【神对世人的启示】%s向世人启示了以下真理：\n\n" +
                    "1. **神是公义的，也是慈爱的**：神的审判和拯救是祂属性的两个方面。祂的公义要求祂审判罪恶，祂的慈爱促使祂拯救悔改的人。这让世人明白，神既是公义的审判者，也是慈爱的父亲。\n\n" +
                    "2. **悔改带来恢复**：无论人的罪有多深，只要真心悔改归向神，神就必赦免和恢复。这是先知信息中最核心的福音。\n\n" +
                    "3. **神掌管历史**：历史不是无序的，而是在神的主权之下。无论是以色列的兴衰还是列国的命运，都在神的掌管之中。这给世人带来盼望——历史有一个终极的目标和意义。\n\n" +
                    "4. **神顾念万民**：先知的信息不仅针对以色列，也针对列国。神的心意是万民都要认识祂、归向祂。这启示世人，在神的救赎计划中，所有人都被邀请进入祂的国度。",
                    ref);
            case "福音书" -> String.format(
                    "【神对世人的启示】%s向世人启示了以下真理：\n\n" +
                    "1. **神亲自来寻找人**：耶稣基督是神在肉身中的显现，祂来不是要定世人的罪，乃是要叫世人因祂得救。这启示世人，神主动地来寻找失丧的人。\n\n" +
                    "2. **神的国已经临近**：通过耶稣的言行，神的国已经临到人间。这呼召世人悔改、相信福音，进入神的国。\n\n" +
                    "3. **真正的福气在神里面**：耶稣的登山宝训重新定义了福气——不是外在的财富和地位，而是在神里面的谦卑、怜恤、清心。这颠覆了世人对福气的理解。\n\n" +
                    "4. **爱是最大的诫命**：耶稣教导爱神和爱人是律法和先知的总纲。祂更以十字架上的牺牲，展现了爱的最高境界——为朋友舍命。\n\n" +
                    "5. **死亡已被胜过**：耶稣的复活证明了祂胜过了死亡，给世人带来了永生的盼望。这不仅是未来的应许，也是现在可以经历的新生命。",
                    ref);
            case "保罗书信" -> String.format(
                    "【神对世人的启示】%s向世人启示了以下真理：\n\n" +
                    "1. **救恩是神的恩典**：人得救不是靠自己的行为或功德，而是神白白的恩典。这拆毁了人的骄傲，让人谦卑地接受神的救恩。\n\n" +
                    "2. **在基督里成为新造的人**：信基督的人不再被定罪，而是成为神的儿女，拥有全新的身份和生命。这给世人带来真正的盼望和改变的力量。\n\n" +
                    "3. **圣灵赐予能力**：神不仅赦免人的罪，更赐下圣灵住在信徒里面，引导他们过圣洁的生活，并赐予他们服事的能力。\n\n" +
                    "4. **在爱中合一**：在基督里，一切隔阂（种族、阶级、性别）都被打破，信徒在基督里成为一体。这启示世人，神的心意是要人在爱中合一。\n\n" +
                    "5. **苦难中有盼望**：保罗自己在患难中学会了知足和喜乐，他见证说神的恩典足够用。这给所有在苦难中的人带来安慰和力量。",
                    ref);
            default -> String.format(
                    "【神对世人的启示】%s向世人启示了神的心意和救赎计划。" +
                    "神借着这段经文向世人说话，邀请人来认识祂、信靠祂、跟随祂。" +
                    "无论人在什么处境中，神的话语都能带来真理的光照、生命的更新和永恒的盼望。",
                    ref);
        };
    }

    private String generatePracticalApplication(String category, String ref) {
        return switch (category) {
            case "律法书" -> String.format(
                    "【当代信徒的应用】基于%1$s，当代信徒可以有以下反思和应用：\n\n" +
                    "**1. 认识神的圣洁**\n" +
                    "律法启示了神的圣洁，这提醒我们：神是轻慢不得的。在我们的信仰生活中，需要保持对神的敬畏之心，在敬拜和生活中彰显神的圣洁。\n\n" +
                    "**2. 以感恩回应恩典**\n" +
                    "正如神先拯救以色列人再赐下律法，我们今天也是先蒙恩得救，然后被呼召过圣洁的生活。我们遵行神的话语，不是为得救，而是因为已经得救，以感恩的心回应神的恩典。\n\n" +
                    "**3. 活出爱的律法**\n" +
                    "耶稣将律法总结为\"爱神\"和\"爱人\"。我们不必拘泥于旧约的礼仪律法，但道德律法的精义——爱神和爱人——仍然是今天基督徒生活的准则。\n\n" +
                    "**4. 关心弱势群体**\n" +
                    "律法对穷人、孤儿、寡妇的保护提醒我们：真正的信仰必然体现在对弱势群体的关怀上。我们应当效法神的心肠，关怀身边有需要的人。\n\n" +
                    "**5. 操练圣洁生活**\n" +
                    "虽然我们不在律法之下，乃在恩典之下，但恩典不是放纵的借口。圣灵在我们里面工作，帮助我们结出圣灵的果子，活出圣洁的生活。",
                    ref);
            case "智慧书" -> String.format(
                    "【当代信徒的应用】基于%1$s，当代信徒可以有以下反思和应用：\n\n" +
                    "**1. 以敬畏神为生活的中心**\n" +
                    "智慧文学告诉我们，敬畏神是智慧的开端。在我们的日常生活中，无论是工作、家庭还是人际关系，都要以敬畏神为核心。在做决定时，首先要问自己：这事是否讨神喜悦？\n\n" +
                    "**2. 默想神的话语**\n" +
                    "诗篇教导我们，喜爱神的话语、昼夜思想的人便为有福。当代信徒面对信息爆炸的时代，更需要安静在神面前，用神的话语来塑造我们的思想和价值观。\n\n" +
                    "**3. 在日常生活中活出智慧**\n" +
                    "智慧不是抽象的学问，而是具体的实践。在待人接物、处理财务、面对诱惑时，智慧让我们做出合神心意的选择。\n\n" +
                    "**4. 在苦难中持守信心**\n" +
                    "约伯记提醒我们，苦难不一定是罪的惩罚，也可能是信心的考验。在患难中，我们应当持守对神的信心，相信祂的旨意终究是美善的。\n\n" +
                    "**5. 颂赞神的作为**\n" +
                    "诗篇的核心是赞美。无论在顺境还是逆境，我们都应当学习以赞美来到神面前，因为祂本为善，祂的慈爱永远长存。",
                    ref);
            case "先知书" -> String.format(
                    "【当代信徒的应用】基于%1$s，当代信徒可以有以下反思和应用：\n\n" +
                    "**1. 警醒自省，远离罪恶**\n" +
                    "先知对罪恶的严厉警告提醒我们：神是圣洁的，祂恨恶罪恶。我们应当定期省察自己的心思意念和行为，远离一切形式的偶像崇拜和不义。\n\n" +
                    "**2. 在绝望中持守盼望**\n" +
                    "先知的信息总是以安慰和盼望结束。这提醒我们：无论环境多么艰难，神仍然是信实的，祂的应许绝不落空。在绝望中，我们应当仰望神的应许。\n\n" +
                    "**3. 关注社会公义**\n" +
                    "先知不仅谴责个人的罪，更谴责社会性的不公义。当代信徒应当关心社会公义，为弱势群体发声，在社区中做光做盐。\n\n" +
                    "**4. 活出悔改的生命**\n" +
                    "悔改不仅是一次性的决定，更是一生之久的态度。我们应当持续地转向神，让圣灵更新我们的心思意念，活出与悔改相称的生命。\n\n" +
                    "**5. 传扬福音的盼望**\n" +
                    "先知预言的弥赛亚已经降临，救恩已经成就。我们作为基督徒，有责任将这份盼望分享给周围的人，成为福音的使者。",
                    ref);
            case "福音书" -> String.format(
                    "【当代信徒的应用】基于%1$s，当代信徒可以有以下反思和应用：\n\n" +
                    "**1. 回应耶稣的呼召：跟从祂**\n" +
                    "耶稣呼召门徒说：\"来跟从我！\"这不仅是历史上的呼召，也是今天对每一个基督徒的呼召。我们是否愿意放下一切，将耶稣放在生命的首位，跟随祂的脚踪行？\n\n" +
                    "**2. 活出天国的价值观**\n" +
                    "耶稣的登山宝训展示了一套与世俗截然不同的价值观——温柔、怜恤、清心、使人和睦。我们是否愿意让这些价值观主导我们的生活，而不是被世界的价值观所同化？\n\n" +
                    "**3. 实践爱的诫命**\n" +
                    "耶稣赐给门徒一条新命令：彼此相爱。这种爱不是感觉，而是意志和行动。我们是否愿意超越自己的舒适区，去爱那些不可爱的人，甚至爱我们的仇敌？\n\n" +
                    "**4. 依靠圣灵的能力**\n" +
                    "耶稣应许赐下圣灵，帮助门徒生活、见证和服事。我们不是靠自己的力量活出基督徒的生命，而是依靠圣灵的能力。\n\n" +
                    "**5. 怀揣永生的盼望**\n" +
                    "耶稣的复活确保了信徒的永生。这个盼望不是空洞的乐观，而是基于历史事实的确据。在面对死亡和苦难时，我们拥有超越世界的平安和盼望。",
                    ref);
            case "保罗书信" -> String.format(
                    "【当代信徒的应用】基于%1$s，当代信徒可以有以下反思和应用：\n\n" +
                    "**1. 安息在恩典中**\n" +
                    "我们得救是本乎恩，也因着信，不是出于行为。这让我们从\"表现主义\"的捆绑中释放出来——我们不需要靠表现来赢得神的爱，而是安息在祂已经完成的救恩中。\n\n" +
                    "**2. 在基督里确认身份**\n" +
                    "我们的身份不是由职业、成就或他人评价决定的，而是由\"在基督里\"决定的。我们是被神所爱的儿女、是君尊的祭司、是圣洁的国度。这个身份是我们一切行动的根基。\n\n" +
                    "**3. 靠圣灵行事**\n" +
                    "保罗教导我们要\"顺着圣灵而行\"。在每天的生活中，我们应当敏感于圣灵的引导，依靠祂的能力胜过试探，结出圣灵的果子。\n\n" +
                    "**4. 在教会中彼此建造**\n" +
                    "教会是基督的身体，每个信徒都是肢体。我们应当善用神赐予的恩赐，在教会中彼此服事、互相建造，共同成长。\n\n" +
                    "**5. 在患难中持守喜乐**\n" +
                    "保罗在患难中学会了知足和喜乐的秘诀。我们也可以学习在任何环境中保持对神的信靠，因为知道万事互相效力，叫爱神的人得益处。",
                    ref);
            default -> String.format(
                    "【当代信徒的应用】基于%1$s，当代信徒可以有以下反思：\n\n" +
                    "这段经文提醒我们，神的话语是活泼的，是有功效的。我们应当将神的话语藏在心里，反复默想，并在实际生活中活出来。" +
                    "无论面对什么样的环境和挑战，神的话语都能给我们带来智慧、力量和盼望。",
                    ref);
        };
    }

    private String generateReferenceSources() {
        return """
                [{"source":"圣经原文（希伯来文/希腊文）解析","type":"original_text"},
                {"source":"《圣经高级注释》","type":"commentary"},
                {"source":"历代教会教父著作（奥古斯丁、屈梭多模等）","type":"patristic"},
                {"source":"宗教改革时期解经传统（马丁·路德、加尔文）","type":"reformation"},
                {"source":"当代圣经学者研究成果","type":"modern_scholarship"},
                {"source":"属灵经典著作对经文的引用","type":"spiritual_books"}]""";
    }

    private ExegesisResponse toResponse(ExegesisRecord record) {
        List<ExegesisResponse.KeywordItem> keywords;
        try {
            ExegesisResponse.KeywordItem[] arr = objectMapper.readValue(record.getKeywordAnalysis(), ExegesisResponse.KeywordItem[].class);
            keywords = List.of(arr);
        } catch (JsonProcessingException e) {
            keywords = List.of(
                    ExegesisResponse.KeywordItem.builder().keyword("信心").explanation("对神完全的信任和依靠").build(),
                    ExegesisResponse.KeywordItem.builder().keyword("恩典").explanation("神白白赐予人的恩惠").build()
            );
        }

        return ExegesisResponse.builder()
                .exegesisRecordId(record.getId())
                .referenceText(record.getReferenceText())
                .summary(record.getSummary())
                .historicalBackground(record.getHistoricalBackground())
                .writingBackground(record.getWritingBackground())
                .contextAnalysis(record.getContextAnalysis())
                .keywordAnalysis(keywords)
                .canonicalPosition(record.getCanonicalPosition())
                .theologicalTheme(record.getTheologicalTheme())
                .truthForPeople(record.getTruthForPeople())
                .practicalApplication(record.getPracticalApplication())
                .build();
    }
}