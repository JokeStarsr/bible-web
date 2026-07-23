package com.bible.module.exegesis.service;

import com.bible.common.exception.BusinessException;
import com.bible.config.LlmConfig;
import com.bible.config.LlmService;
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
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final LlmService llmService;
    private final LlmConfig llmConfig;

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

        // 优先调用大模型生成专业解经；未配置或失败时降级为模板解经
        ExegesisRecord record;
        if (llmConfig.isEnabled()) {
            try {
                record = generateLlmExegesis(genRecord, book, verses, verseText);
            } catch (Exception e) {
                log.warn("大模型解经失败，降级为模板解经: {}", e.getMessage());
                record = generateTemplateExegesis(genRecord, book, verses, verseText);
            }
        } else {
            log.info("未配置大模型 API Key，使用模板解经");
            record = generateTemplateExegesis(genRecord, book, verses, verseText);
        }

        exegesisRecordMapper.insert(record);
        return toResponse(record);
    }

    private ExegesisRecord generateLlmExegesis(ScriptureGenerationRecord genRecord, BibleBook book,
                                                List<BibleVerse> verses, String verseText) {
        String ref = genRecord.getReferenceText();
        String bookName = book.getBookNameZh();
        String testament = book.getTestament();
        String category = classifyBook(book);

        String systemPrompt = """
                你是一位精通圣经原文（希伯来文、希腊文）、教会历史、系统神学和释经学的资深神学教授。
                你的任务是根据用户提供的经文内容，生成一份专业、深入、贴近经文本质的解经报告。
                报告必须基于具体经文内容，避免空泛的套话；要体现原文词义、历史背景、文学结构和神学意义。
                请使用简体中文输出，并按照指定的 JSON 格式返回，不要包含任何 JSON 之外的解释文字。
                """;

        String userPrompt = String.format("""
                请为以下经文生成解经报告：

                书卷：%s（%s / %s）
                经文位置：%s

                经文内容：
                %s

                请严格按照以下 JSON 格式返回（keywordAnalysis 是对象数组，每个对象包含 keyword 和 explanation 两个字段）：
                {
                  "summary": "经文摘要：用2-3句话概括这段经文的核心信息，紧扣具体经文内容。",
                  "originalTextNote": "原文翻译与注释：挑选1-3处关键原文词汇（希伯来文/希腊文），给出音译、基本含义、在经文中的特殊用法，以及为何这个原词重要。",
                  "verseByVerse": "逐节解析：按经文顺序逐节或逐段解释，说明每节在上下文中的作用和意义。",
                  "historicalBackground": "历史背景：结合经文所在时代的社会、政治、宗教环境，说明经文当时要回应什么问题。",
                  "writingBackground": "写作背景：简述本书卷的作者、写作目的、文体特征，以及这段经文在整卷书中的位置。",
                  "contextAnalysis": "上下文关系：说明这段经文与前后文、整卷书、乃至整个圣经正典的关联。",
                  "keywordAnalysis": [
                    {"keyword": "关键词1", "explanation": "该词在经文中的含义与神学意义。"},
                    {"keyword": "关键词2", "explanation": "该词在经文中的含义与神学意义。"},
                    {"keyword": "关键词3", "explanation": "该词在经文中的含义与神学意义。"}
                  ],
                  "canonicalPosition": "在整本圣经中的位置：说明这段经文如何指向或呼应救赎历史、基督应验、新约教导等。",
                  "theologicalTheme": "神学主题：提炼2-3个核心神学主题，并结合经文具体阐释。",
                  "truthForPeople": "神对世人的启示：总结这段经文向今天的人启示了关于神、人、罪、恩典、盼望的哪些真理。",
                  "practicalApplication": "对当代信徒的应用：给出具体、可实践的生命回应和应用建议。"
                }
                """, bookName, testament, category, ref, verseText);

        String llmResult = llmService.chat(systemPrompt, userPrompt);
        String json = llmService.extractJson(llmResult);

        JsonNode root;
        try {
            root = objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            log.error("大模型返回的 JSON 解析失败: {}", json, e);
            throw new RuntimeException("大模型返回格式无法解析", e);
        }

        ExegesisRecord record = new ExegesisRecord();
        record.setId(UUID.randomUUID());
        record.setGenerationRecordId(genRecord.getId());
        record.setVersionId(genRecord.getVersionId());
        record.setReferenceText(ref);
        record.setSourceType("ai_generated");
        record.setSummary(textNode(root, "summary"));
        record.setOriginalTextNote(textNode(root, "originalTextNote"));
        record.setVerseByVerse(textNode(root, "verseByVerse"));
        record.setHistoricalBackground(textNode(root, "historicalBackground"));
        record.setWritingBackground(textNode(root, "writingBackground"));
        record.setContextAnalysis(textNode(root, "contextAnalysis"));
        record.setKeywordAnalysis(stringifyNode(root.path("keywordAnalysis")));
        record.setCanonicalPosition(textNode(root, "canonicalPosition"));
        record.setTheologicalTheme(textNode(root, "theologicalTheme"));
        record.setTruthForPeople(textNode(root, "truthForPeople"));
        record.setPracticalApplication(textNode(root, "practicalApplication"));
        record.setReferenceSources("[{\"source\":\"大模型智能解经\",\"type\":\"ai\"}]");
        record.setStatus("approved");
        record.setAiModelName(llmConfig.getModel());
        record.setPromptVersion("v3.0");
        record.setCreatedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());
        return record;
    }

    private String textNode(JsonNode root, String field) {
        if (root == null) return "";
        JsonNode node = root.path(field);
        return node.isMissingNode() || node.isNull() ? "" : node.asText().trim();
    }

    private String stringifyNode(JsonNode node) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(node);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    // ==================== 以下为未配置大模型时的模板解经（保持原有逻辑作为 fallback）====================

    private ExegesisRecord generateTemplateExegesis(ScriptureGenerationRecord genRecord, BibleBook book, List<BibleVerse> verses, String verseText) {
        String ref = genRecord.getReferenceText();
        String bookName = book.getBookNameZh();
        int startCh = genRecord.getStartChapter();
        int startV = genRecord.getStartVerse();
        int endCh = genRecord.getEndChapter();
        int endV = genRecord.getEndVerse();
        String bookCategory = classifyBook(book);

        ExegesisRecord record = new ExegesisRecord();
        record.setId(UUID.randomUUID());
        record.setGenerationRecordId(genRecord.getId());
        record.setVersionId(genRecord.getVersionId());
        record.setReferenceText(ref);
        record.setSourceType("ai_generated");

        record.setSummary(generateSummary(book, bookCategory, ref, startCh, startV, endCh, endV));
        record.setOriginalTextNote(generateOriginalTextNote(book, bookCategory, ref, verseText));
        record.setVerseByVerse(generateVerseByVerse(verses));
        record.setHistoricalBackground(generateHistoricalBackground(book, bookCategory, startCh));
        record.setWritingBackground(generateWritingBackground(book, bookCategory));
        record.setContextAnalysis(generateContextAnalysis(book, ref, startCh, startV, endCh, endV));
        record.setKeywordAnalysis(generateKeywordAnalysis(bookCategory, ref, verseText));
        record.setCanonicalPosition(generateCanonicalPosition(book, bookCategory));
        record.setTheologicalTheme(generateTheologicalTheme(book, bookCategory, ref));
        record.setTruthForPeople(generateTruthForPeople(bookCategory, ref));
        record.setPracticalApplication(generatePracticalApplication(bookCategory, ref));
        record.setReferenceSources(generateReferenceSources());
        record.setStatus("approved");
        record.setAiModelName("bible-exegesis-template");
        record.setPromptVersion("v3.0");
        record.setCreatedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());
        return record;
    }

    private String classifyBook(BibleBook book) {
        String name = book.getBookNameZh();
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

    private String generateOriginalTextNote(BibleBook book, String category, String ref, String verseText) {
        return String.format("【原文翻译与注释】%s是%s的一部分。虽然当前系统未配置大模型 API Key，无法给出针对这段具体经文的原文词汇分析，但你可以从以下方面自行默想：\n\n" +
                "1. 这段经文中的核心动词和名词，在原文中往往带有比中文译本更丰富的含义。例如，智慧书中的\"敬畏\"、先知书中的\"回转/悔改\"、保罗书信中的\"恩典\"等，都是理解整段经文的关键。\n\n" +
                "2. 建议结合一本好的原文 Concordance（经文汇编）或圣经注释书，查看关键词在原文中的使用频率和上下文。\n\n" +
                "3. 本段经文的经文内容如下，可供你参考默想：\n%s",
                ref, category, verseText);
    }

    private String generateVerseByVerse(List<BibleVerse> verses) {
        StringBuilder sb = new StringBuilder("【逐节解析】\n\n");
        for (BibleVerse v : verses) {
            sb.append(String.format("**%d:%d** %s\n\n", v.getChapterNumber(), v.getVerseNumber(), v.getVerseText()))
              .append("这节经文在整段经文中承担着推进主题的作用。默想时要关注它与前后的逻辑关系，以及它所揭示的神的属性或人的回应。\n\n");
        }
        return sb.toString().trim();
    }

    private String generateSummary(BibleBook book, String category, String ref, int sc, int sv, int ec, int ev) {
        return String.format("【经文摘要】%s（%s）的这段经文（%s）向我们传递了宝贵的属灵信息。由于当前系统未配置大模型 API Key，" +
                "无法生成针对具体经文的精细摘要，但你可以从经文字面意思出发，结合其所属的%s类别，默想神在这段经文中要表达的心意。",
                book.getBookNameZh(), category, ref, category);
    }

    private String generateHistoricalBackground(BibleBook book, String category, int chapter) {
        return String.format("【历史背景】%s属于%s。这段经文写于特定的历史环境中，当时的社会、政治和宗教背景对理解经文有重要影响。" +
                "建议在解经时参考可靠的圣经注释书，了解本章（第%d章）所处的历史时期。",
                book.getBookNameZh(), category, chapter);
    }

    private String generateWritingBackground(BibleBook book, String category) {
        return String.format("【写作背景】%s是%s的一部分。作者在圣灵的默示下，为特定的读者群体写下了这卷书。" +
                "作者的写作目的和读者的处境，对准确把握这段经文的信息至关重要。",
                book.getBookNameZh(), category);
    }

    private String generateContextAnalysis(BibleBook book, String ref, int sc, int sv, int ec, int ev) {
        return String.format("【上下文关系】%s在整卷书的论证或叙事结构中占据重要位置。这段经文与前后文密切关联，" +
                "共同构成了一个完整的思想单元。理解它所处的上下文，是正确解释这段经文的前提。",
                ref);
    }

    private String generateKeywordAnalysis(String category, String ref, String verseText) {
        List<Map<String, String>> keywords = new ArrayList<>();
        keywords.add(Map.of("keyword", "信心", "explanation", "对神完全的信赖和依靠，是信仰生活的根基。"));
        keywords.add(Map.of("keyword", "恩典", "explanation", "神白白赐予人的恩惠和帮助。"));
        keywords.add(Map.of("keyword", "盼望", "explanation", "对神应许的确实期待。"));
        try {
            return objectMapper.writeValueAsString(keywords);
        } catch (JsonProcessingException e) {
            return "[]";
        }
    }

    private String generateCanonicalPosition(BibleBook book, String category) {
        return String.format("【在整本圣经中的位置】%s是圣经正典的一部分，在圣经的渐进启示中发挥着独特的作用。" +
                "它与圣经中其他书卷共同构成了完整的启示，彼此印证、互为补充。",
                book.getBookNameZh());
    }

    private String generateTheologicalTheme(BibleBook book, String category, String ref) {
        return String.format("【神学主题】%s所涉及的核心神学主题与神的启示和救赎计划密切相关。" +
                "这段经文在圣经神学中具有重要的位置，对理解神的属性和祂对人的心意有深刻的启迪。",
                ref);
    }

    private String generateTruthForPeople(String category, String ref) {
        return String.format("【神对世人的启示】%s向世人启示了神的心意和救赎计划。" +
                "神借着这段经文向世人说话，邀请人来认识祂、信靠祂、跟随祂。" +
                "无论人在什么处境中，神的话语都能带来真理的光照、生命的更新和永恒的盼望。",
                ref);
    }

    private String generatePracticalApplication(String category, String ref) {
        return String.format("【当代信徒的应用】基于%s，当代信徒可以反思：神的话语是活泼的，是有功效的。" +
                "我们应当将神的话语藏在心里，反复默想，并在实际生活中活出来。" +
                "无论面对什么样的环境和挑战，神的话语都能给我们带来智慧、力量和盼望。",
                ref);
    }

    private String generateReferenceSources() {
        return "[{\"source\":\"圣经原文（希伯来文/希腊文）解析\",\"type\":\"original_text\"}," +
                "{\"source\":\"《圣经高级注释》\",\"type\":\"commentary\"}," +
                "{\"source\":\"历代教会教父著作\",\"type\":\"patristic\"}," +
                "{\"source\":\"宗教改革时期解经传统\",\"type\":\"reformation\"}," +
                "{\"source\":\"当代圣经学者研究成果\",\"type\":\"modern_scholarship\"}]";
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
                .originalTextNote(record.getOriginalTextNote())
                .verseByVerse(record.getVerseByVerse())
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
