package com.bible.module.dailythought.service;

import com.bible.common.exception.BusinessException;
import com.bible.config.LlmConfig;
import com.bible.config.LlmService;
import com.bible.module.dailythought.dto.DailyThoughtHistoryResponse;
import com.bible.module.dailythought.dto.DailyThoughtRequest;
import com.bible.module.dailythought.dto.DailyThoughtResponse;
import com.bible.module.dailythought.dto.SaveDailyThoughtRequest;
import com.bible.module.dailythought.entity.DailyThoughtRecord;
import com.bible.module.dailythought.mapper.DailyThoughtRecordMapper;
import com.bible.module.scripture.entity.BibleBook;
import com.bible.module.scripture.entity.BibleVerse;
import com.bible.module.scripture.mapper.BibleBookMapper;
import com.bible.module.scripture.mapper.BibleVerseMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyThoughtService {

    private final LlmService llmService;
    private final LlmConfig llmConfig;
    private final BibleVerseMapper verseMapper;
    private final BibleBookMapper bookMapper;
    private final DailyThoughtRecordMapper dailyThoughtRecordMapper;
    private final ObjectMapper objectMapper;

    public DailyThoughtResponse generate(DailyThoughtRequest req) {
        if (!llmConfig.isEnabled()) {
            throw new BusinessException("LLM_NOT_CONFIGURED", "大模型未配置 API Key，无法生成今日随想回应。请联系管理员配置 LLM_API_KEY 环境变量。");
        }

        // 1. 用 LLM 分析用户随想，推荐经文引用
        List<BibleVerse> matchedVerses = findMatchedVerses(req.getContent());
        String scriptureContext = buildScriptureContext(matchedVerses);

        // 2. 用 LLM 生成牧养性回应
        String systemPrompt = """
                你是一位满有牧养心肠、熟悉圣经的属灵导师。
                用户会写下自己今天的随想、感悟、挣扎或日记。
                请你基于圣经真理，温柔地回应用户，并提供 1-3 段与用户心境最相关的圣经经文。
                回应应当有温度、贴近人心，同时忠于圣经。
                请使用简体中文，并按指定 JSON 格式返回，不要包含 JSON 之外的任何文字。
                """;

        String userPrompt = String.format("""
                用户的今日随想：
                %s

                我已从圣经数据库中为用户初步匹配到以下经文（可能为空）：
                %s

                请根据用户随想的内容，生成以下 JSON：
                {
                  "pastoralResponse": "一段温柔、有牧养性的回应，理解用户的感受，并给予鼓励和引导。200字左右。",
                  "scriptures": [
                    {
                      "reference": "经文引用，如 诗篇 23:1-3",
                      "text": "经文的中文内容（和合本风格）",
                      "relevance": "说明这段经文与今日随想的关联，以及它如何回应用户的心境。"
                    }
                  ],
                  "divineWord": "用第一人称\"神可能想对你说：\"的格式，总结一段简短的神的话语，给用户力量和盼望。100字左右。"
                }
                """, req.getContent(), scriptureContext);

        String llmResult;
        try {
            llmResult = llmService.chat(systemPrompt, userPrompt);
        } catch (Exception e) {
            log.error("调用大模型生成今日随想失败", e);
            throw new BusinessException("LLM_CALL_FAILED", "生成今日随想失败：" + e.getMessage());
        }

        String json = llmService.extractJson(llmResult);
        JsonNode root;
        try {
            root = objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            log.error("今日随想大模型返回 JSON 解析失败: {}", json, e);
            throw new BusinessException("LLM_RESPONSE_INVALID", "大模型返回格式异常");
        }

        String pastoralResponse = textNode(root, "pastoralResponse");
        String divineWord = textNode(root, "divineWord");
        List<DailyThoughtResponse.ScriptureMatch> scriptures = parseScriptures(root.path("scriptures"));

        return DailyThoughtResponse.builder()
                .pastoralResponse(pastoralResponse)
                .scriptures(scriptures)
                .divineWord(divineWord)
                .build();
    }

    @Transactional
    public void save(UUID userId, SaveDailyThoughtRequest req) {
        String scripturesJson;
        try {
            scripturesJson = objectMapper.writeValueAsString(req.getScriptures() == null ? Collections.emptyList() : req.getScriptures());
        } catch (JsonProcessingException e) {
            log.error("保存今日随想时经文序列化失败", e);
            throw new BusinessException("SAVE_FAILED", "保存失败，请重试");
        }

        DailyThoughtRecord record = new DailyThoughtRecord();
        record.setId(UUID.randomUUID());
        record.setUserId(userId);
        record.setContent(req.getContent());
        record.setPastoralResponse(req.getPastoralResponse());
        record.setDivineWord(req.getDivineWord());
        record.setScriptures(scripturesJson);
        record.setCreatedAt(LocalDateTime.now());

        dailyThoughtRecordMapper.insert(record);
    }

    public List<DailyThoughtHistoryResponse> listByUser(UUID userId, int page, int size) {
        int offset = (page - 1) * size;
        List<DailyThoughtRecord> records = dailyThoughtRecordMapper.findByUserId(userId, offset, size);
        List<DailyThoughtHistoryResponse> result = new ArrayList<>(records.size());
        for (DailyThoughtRecord record : records) {
            List<DailyThoughtResponse.ScriptureMatch> scriptures = parseScripturesJson(record.getScriptures());
            result.add(DailyThoughtHistoryResponse.builder()
                    .id(record.getId())
                    .content(record.getContent())
                    .pastoralResponse(record.getPastoralResponse())
                    .divineWord(record.getDivineWord())
                    .scriptures(scriptures)
                    .createdAt(record.getCreatedAt())
                    .build());
        }
        return result;
    }

    private List<DailyThoughtResponse.ScriptureMatch> parseScripturesJson(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            JsonNode node = objectMapper.readTree(json);
            return parseScriptures(node);
        } catch (JsonProcessingException e) {
            log.warn("解析历史记录经文 JSON 失败: {}", json, e);
            return Collections.emptyList();
        }
    }

    /**
     * 从本地经文数据库中匹配一些经文，作为 LLM 的上下文参考。
     * 当前采用简单策略：用 LLM 先提取关键词，再在本地经文中搜索包含这些关键词的经文。
     * 为简化实现，这里先返回少量热门经文作为示例上下文。
     */
    private List<BibleVerse> findMatchedVerses(String content) {
        // 简单关键词匹配：收集所有经文，筛选出包含用户内容中高频情感词的经文
        List<BibleBook> books = bookMapper.findByVersionId(getDefaultVersionId());
        if (books.isEmpty()) {
            return List.of();
        }

        List<BibleVerse> allVerses = new ArrayList<>();
        for (BibleBook book : books) {
            List<Integer> chapters = verseMapper.findChaptersByBookId(book.getId());
            for (int ch : chapters) {
                allVerses.addAll(verseMapper.findByBookAndChapter(book.getId(), ch));
            }
        }

        // 关键词匹配：取用户内容中的部分关键词进行匹配
        String[] keywords = extractKeywords(content);
        List<BibleVerse> matched = new ArrayList<>();
        for (BibleVerse v : allVerses) {
            for (String kw : keywords) {
                if (v.getVerseText().contains(kw)) {
                    matched.add(v);
                    break;
                }
            }
            if (matched.size() >= 10) break;
        }
        return matched;
    }

    private String[] extractKeywords(String content) {
        // 简单实现：取内容中长度 >= 2 的非停用词作为关键词
        String[] stopWords = {"今天", "我们", "自己", "觉得", "感觉", "就是", "但是", "因为", "所以", "然后", "现在", "已经", "可以", "不能"};
        String normalized = content.replaceAll("[\\p{P}\\s]+", " ");
        java.util.Set<String> stopSet = java.util.Set.of(stopWords);
        List<String> keywords = new ArrayList<>();
        for (String word : normalized.split(" ")) {
            if (word.length() >= 2 && !stopSet.contains(word)) {
                keywords.add(word);
                if (keywords.size() >= 5) break;
            }
        }
        return keywords.toArray(new String[0]);
    }

    private String buildScriptureContext(List<BibleVerse> verses) {
        if (verses.isEmpty()) return "（暂无本地经文匹配）";
        StringBuilder sb = new StringBuilder();
        for (BibleVerse v : verses) {
            BibleBook book = bookMapper.findById(v.getBookId());
            String bookName = book != null ? book.getBookNameZh() : "";
            sb.append(String.format("%s %d:%d %s\n", bookName, v.getChapterNumber(), v.getVerseNumber(), v.getVerseText()));
        }
        return sb.toString().trim();
    }

    private List<DailyThoughtResponse.ScriptureMatch> parseScriptures(JsonNode node) {
        List<DailyThoughtResponse.ScriptureMatch> list = new ArrayList<>();
        if (node == null || !node.isArray()) {
            return list;
        }
        for (JsonNode item : node) {
            list.add(DailyThoughtResponse.ScriptureMatch.builder()
                    .reference(textNode(item, "reference"))
                    .text(textNode(item, "text"))
                    .relevance(textNode(item, "relevance"))
                    .build());
        }
        return list;
    }

    private String textNode(JsonNode root, String field) {
        if (root == null) return "";
        JsonNode node = root.path(field);
        return node.isMissingNode() || node.isNull() ? "" : node.asText().trim();
    }

    private UUID getDefaultVersionId() {
        // 简单返回默认版本 ID；实际可通过 BibleVersionMapper 查询
        return UUID.fromString("00000000-0000-0000-0000-000000000001");
    }
}
