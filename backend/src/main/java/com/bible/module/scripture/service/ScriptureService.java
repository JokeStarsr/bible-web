package com.bible.module.scripture.service;

import com.bible.common.exception.BusinessException;
import com.bible.config.LlmService;
import com.bible.module.scripture.dto.GenerateScriptureRequest;
import com.bible.module.scripture.dto.GenerateScriptureResponse;
import com.bible.module.scripture.entity.BibleBook;
import com.bible.module.scripture.entity.BibleVersion;
import com.bible.module.scripture.entity.BibleVerse;
import com.bible.module.scripture.entity.ScriptureGenerationRecord;
import com.bible.module.scripture.mapper.BibleBookMapper;
import com.bible.module.scripture.mapper.BibleVerseMapper;
import com.bible.module.scripture.mapper.BibleVersionMapper;
import com.bible.module.scripture.mapper.ScriptureGenerationRecordMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScriptureService {

    private final BibleVersionMapper versionMapper;
    private final BibleBookMapper bookMapper;
    private final BibleVerseMapper verseMapper;
    private final ScriptureGenerationRecordMapper generationRecordMapper;
    private final LlmService llmService;

    private final Random random = new Random();

    private final java.util.concurrent.ExecutorService translationExecutor =
            java.util.concurrent.Executors.newFixedThreadPool(2);

    @Transactional
    public GenerateScriptureResponse generate(UUID userId, GenerateScriptureRequest req) {
        // 韩文模式：优先使用本地韩文版圣经（개역한글판），不走LLM翻译
        boolean useKorean = "ko".equals(req.getLang());
        BibleVersion version;
        if (useKorean) {
            BibleVersion koVersion = versionMapper.findByLanguage("ko");
            if (koVersion != null) {
                version = koVersion;
            } else {
                version = getVersion(req.getVersionCode());
                useKorean = false; // 没有韩文版数据，降级为中文+LLM翻译
            }
        } else {
            version = getVersion(req.getVersionCode());
        }

        List<BibleBook> books = bookMapper.findByVersionId(version.getId());
        if (books.isEmpty()) {
            throw new BusinessException("SCRIPTURE_GENERATION_FAILED", "圣经数据未就绪");
        }

        String type = req.getGenerationType();
        GenerateScriptureResponse response;

        if ("chapter_full".equals(type)) {
            List<BibleBook> shuffled = new ArrayList<>(books);
            Collections.shuffle(shuffled, random);
            for (BibleBook book : shuffled) {
                int chapter = random.nextInt(book.getChapterCount()) + 1;
                List<BibleVerse> verses = verseMapper.findByBookAndChapter(book.getId(), chapter);
                if (!verses.isEmpty()) {
                    response = generateChapter(userId, version, book, chapter);
                    if (useKorean) {
                        response = localizeKoreanResponse(response);
                    }
                    return response;
                }
            }
            throw new BusinessException("SCRIPTURE_GENERATION_FAILED", "无可用的完整章节数据");
        } else {
            int verseCount = getVerseCount(type);
            response = generateVerses(userId, version, verseCount, type);
            if (useKorean) {
                response = localizeKoreanResponse(response);
            }
            return response;
        }
    }

    /**
     * 将响应中的书名和索引替换为韩文（数据库原生韩文数据，无需LLM翻译）
     */
    private GenerateScriptureResponse localizeKoreanResponse(GenerateScriptureResponse response) {
        if (response == null || response.getVerses() == null) return response;

        // 经文文本已经是韩文（来自韩文版数据库），只需把书名替换为韩文
        List<GenerateScriptureResponse.VerseItem> newItems = response.getVerses().stream()
            .map(item -> {
                BibleBook book = bookMapper.findById(item.getBookId());
                String koName = book != null ? book.getBookNameKo() : null;
                return GenerateScriptureResponse.VerseItem.builder()
                    .versionId(item.getVersionId())
                    .bookId(item.getBookId())
                    .bookName(koName != null && !koName.isBlank() ? koName : item.getBookName())
                    .chapterNumber(item.getChapterNumber())
                    .verseNumber(item.getVerseNumber())
                    .text(item.getText())
                    .build();
            })
            .collect(Collectors.toList());

        // 重新生成韩文索引文本
        String koReference = buildKoreanReferenceText(newItems);

        return GenerateScriptureResponse.builder()
            .generationRecordId(response.getGenerationRecordId())
            .referenceText(koReference != null ? koReference : response.getReferenceText())
            .generationType(response.getGenerationType())
            .verses(newItems)
            .build();
    }

    /**
     * 用韩文书名重新组装索引文本
     */
    private String buildKoreanReferenceText(List<GenerateScriptureResponse.VerseItem> items) {
        if (items == null || items.isEmpty()) return null;
        GenerateScriptureResponse.VerseItem first = items.get(0);
        GenerateScriptureResponse.VerseItem last = items.get(items.size() - 1);

        if (first.getBookId().equals(last.getBookId())) {
            if (first.getChapterNumber() == last.getChapterNumber()) {
                return String.format("%s %d:%d-%d",
                    first.getBookName(), first.getChapterNumber(),
                    first.getVerseNumber(), last.getVerseNumber());
            } else {
                return String.format("%s %d:%d-%d:%d",
                    first.getBookName(), first.getChapterNumber(),
                    first.getVerseNumber(), last.getChapterNumber(), last.getVerseNumber());
            }
        } else {
            return String.format("%s %d:%d - %s %d:%d",
                first.getBookName(), first.getChapterNumber(), first.getVerseNumber(),
                last.getBookName(), last.getChapterNumber(), last.getVerseNumber());
        }
    }

    private GenerateScriptureResponse translateAsync(GenerateScriptureResponse response) {
        java.util.concurrent.Future<GenerateScriptureResponse> future =
                translationExecutor.submit(() -> translateVersesToKorean(response));
        try {
            return future.get(30, java.util.concurrent.TimeUnit.SECONDS);
        } catch (java.util.concurrent.TimeoutException e) {
            log.warn("Korean translation timed out after 30s, returning Chinese");
            return response;
        } catch (Exception e) {
            log.error("Korean translation failed, returning Chinese", e);
            return response;
        }
    }

    private GenerateScriptureResponse translateVersesToKorean(GenerateScriptureResponse response) {
        try {
            List<GenerateScriptureResponse.VerseItem> items = response.getVerses();
            if (items == null || items.isEmpty()) return response;

            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < items.size(); i++) {
                GenerateScriptureResponse.VerseItem v = items.get(i);
                sb.append("[").append(i).append("] ").append(v.getBookName())
                  .append(" ").append(v.getChapterNumber()).append(":").append(v.getVerseNumber())
                  .append("\n").append(v.getText()).append("\n\n");
            }

            String systemPrompt = "你是圣经翻译专家，精通中文和韩文。请将以下圣经经文准确翻译成韩文（使用개역개정标准译法）。只返回翻译结果，不要任何解释。";
            String userPrompt = "请将以下圣经经文翻译成韩文（개역개정）：\n\n" + sb.toString() +
                "\n请按顺序返回，每节格式：[编号] 书卷名 章:节\\n韩文经文\\n";

            String translated = llmService.chat(systemPrompt, userPrompt);
            log.info("Korean translation generated, length={}", translated != null ? translated.length() : 0);

            if (translated == null || translated.isBlank()) return response;

            Map<Integer, String> translations = new HashMap<>();
            String[] sections = translated.split("\\n(?=\\[\\d+\\])");
            for (String section : sections) {
                section = section.trim();
                if (section.isEmpty()) continue;
                int bracketStart = section.indexOf('[');
                int bracketEnd = section.indexOf(']');
                if (bracketStart < 0 || bracketEnd < 0) continue;
                try {
                    int idx = Integer.parseInt(section.substring(bracketStart + 1, bracketEnd));
                    String text = section.substring(bracketEnd + 1).trim();
                    int newlineIdx = text.indexOf('\n');
                    if (newlineIdx > 0) {
                        text = text.substring(newlineIdx + 1).trim();
                    }
                    translations.put(idx, text);
                } catch (NumberFormatException e) {
                    log.warn("Failed to parse translation index: {}", section.substring(0, Math.min(section.length(), 50)));
                }
            }

            List<GenerateScriptureResponse.VerseItem> newItems = items.stream()
                .map(item -> {
                    int idx = items.indexOf(item);
                    String koText = translations.get(idx);
                    if (koText != null && !koText.isBlank()) {
                        return GenerateScriptureResponse.VerseItem.builder()
                            .versionId(item.getVersionId())
                            .bookId(item.getBookId())
                            .bookName(item.getBookName())
                            .chapterNumber(item.getChapterNumber())
                            .verseNumber(item.getVerseNumber())
                            .text(koText)
                            .build();
                    }
                    return item;
                })
                .collect(Collectors.toList());

            return GenerateScriptureResponse.builder()
                .generationRecordId(response.getGenerationRecordId())
                .referenceText(response.getReferenceText())
                .generationType(response.getGenerationType())
                .verses(newItems)
                .build();

        } catch (Exception e) {
            log.error("Failed to translate verses to Korean, falling back to Chinese", e);
            return response;
        }
    }

    private GenerateScriptureResponse generateChapter(UUID userId, BibleVersion version,
                                                       BibleBook book, int chapter) {
        List<BibleVerse> verses = verseMapper.findByBookAndChapter(book.getId(), chapter);
        if (verses.isEmpty()) {
            throw new BusinessException("SCRIPTURE_GENERATION_FAILED", "该章节无经文数据");
        }

        String referenceText = String.format("%s %d:%d-%d:%d",
                book.getBookNameZh(), chapter, verses.get(0).getVerseNumber(),
                chapter, verses.get(verses.size() - 1).getVerseNumber());

        Map<UUID, BibleBook> bookMap = Map.of(book.getId(), book);
        return buildResponse(userId, version, bookMap, chapter, verses.get(0).getVerseNumber(),
                chapter, verses.get(verses.size() - 1).getVerseNumber(),
                "chapter_full", referenceText, verses);
    }

    private GenerateScriptureResponse generateVerses(UUID userId, BibleVersion version,
                                                      int count, String type) {
        List<BibleBook> allBooks = bookMapper.findByVersionId(version.getId());
        if (allBooks.isEmpty()) {
            throw new BusinessException("SCRIPTURE_GENERATION_FAILED", "圣经数据未就绪");
        }

        // 优化：随机选书卷和章节，避免遍历全部经文（韩文版3万+节）
        // 最多尝试20次找到足够节数的章节
        List<BibleVerse> selected = new ArrayList<>();
        for (int attempt = 0; attempt < 20 && selected.size() < count; attempt++) {
            BibleBook book = allBooks.get(random.nextInt(allBooks.size()));
            List<Integer> chapters = verseMapper.findChaptersByBookId(book.getId());
            if (chapters.isEmpty()) continue;
            int chapter = chapters.get(random.nextInt(chapters.size()));
            List<BibleVerse> verses = verseMapper.findByBookAndChapter(book.getId(), chapter);
            if (verses.isEmpty()) continue;

            if (verses.size() >= count) {
                // 该章节经文足够，随机选连续的 count 节
                int startIdx = random.nextInt(verses.size() - count + 1);
                selected = new ArrayList<>(verses.subList(startIdx, startIdx + count));
                break;
            } else if (selected.isEmpty()) {
                // 该章节经文不够但尚未选到任何经文，用整章
                selected.addAll(verses);
            }
        }

        if (selected.isEmpty()) {
            throw new BusinessException("SCRIPTURE_GENERATION_FAILED", "未选到任何经文");
        }

        return buildVersesResponse(userId, version, type, selected);
    }

    private GenerateScriptureResponse buildVersesResponse(UUID userId, BibleVersion version,
                                                          String type, List<BibleVerse> verses) {
        if (verses.isEmpty()) {
            throw new BusinessException("SCRIPTURE_GENERATION_FAILED", "未选到任何经文");
        }

        BibleVerse first = verses.get(0);
        BibleVerse last = verses.get(verses.size() - 1);

        Set<UUID> bookIds = verses.stream().map(BibleVerse::getBookId).collect(Collectors.toSet());
        Map<UUID, BibleBook> bookMap = bookIds.stream()
                .map(bookMapper::findById)
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(BibleBook::getId, b -> b));
        BibleBook firstBook = bookMap.get(first.getBookId());
        BibleBook lastBook = bookMap.get(last.getBookId());

        String referenceText;
        if (firstBook != null && lastBook != null && firstBook.getId().equals(lastBook.getId())) {
            if (first.getChapterNumber() == last.getChapterNumber()) {
                referenceText = String.format("%s %d:%d-%d",
                        firstBook.getBookNameZh(), first.getChapterNumber(),
                        first.getVerseNumber(), last.getVerseNumber());
            } else {
                referenceText = String.format("%s %d:%d-%d:%d",
                        firstBook.getBookNameZh(), first.getChapterNumber(),
                        first.getVerseNumber(), last.getChapterNumber(), last.getVerseNumber());
            }
        } else if (firstBook != null && lastBook != null) {
            referenceText = String.format("%s %d:%d - %s %d:%d",
                    firstBook.getBookNameZh(), first.getChapterNumber(), first.getVerseNumber(),
                    lastBook.getBookNameZh(), last.getChapterNumber(), last.getVerseNumber());
        } else {
            referenceText = String.format("%d:%d - %d:%d",
                    first.getChapterNumber(), first.getVerseNumber(),
                    last.getChapterNumber(), last.getVerseNumber());
        }

        return buildResponse(userId, version, bookMap,
                first.getChapterNumber(), first.getVerseNumber(),
                last.getChapterNumber(), last.getVerseNumber(),
                type, referenceText, verses);
    }

    private GenerateScriptureResponse buildResponse(UUID userId, BibleVersion version,
                                                     Map<UUID, BibleBook> bookMap, int startChapter, int startVerse,
                                                     int endChapter, int endVerse, String type,
                                                     String referenceText, List<BibleVerse> verses) {
        BibleBook primaryBook = bookMap.get(verses.get(0).getBookId());
        ScriptureGenerationRecord record = new ScriptureGenerationRecord();
        record.setId(UUID.randomUUID());
        record.setUserId(userId);
        record.setVersionId(version.getId());
        record.setGenerationType(type);
        record.setBookId(primaryBook != null ? primaryBook.getId() : verses.get(0).getBookId());
        record.setStartChapter(startChapter);
        record.setStartVerse(startVerse);
        record.setEndChapter(endChapter);
        record.setEndVerse(endVerse);
        record.setReferenceText(referenceText);
        record.setVerseCount(verses.size());
        record.setCreatedAt(LocalDateTime.now());
        generationRecordMapper.insert(record);

        List<GenerateScriptureResponse.VerseItem> items = verses.stream()
                .map(v -> {
                    BibleBook b = bookMap.get(v.getBookId());
                    return GenerateScriptureResponse.VerseItem.builder()
                            .versionId(version.getId())
                            .bookId(v.getBookId())
                            .bookName(b != null ? b.getBookNameZh() : "")
                            .chapterNumber(v.getChapterNumber())
                            .verseNumber(v.getVerseNumber())
                            .text(v.getVerseText())
                            .build();
                })
                .collect(Collectors.toList());

        return GenerateScriptureResponse.builder()
                .generationRecordId(record.getId())
                .referenceText(referenceText)
                .generationType(type)
                .verses(items)
                .build();
    }

    private BibleVersion getVersion(String versionCode) {
        if (versionCode != null && !versionCode.isEmpty()) {
            BibleVersion v = versionMapper.findByCode(versionCode);
            if (v != null) return v;
        }
        BibleVersion defaultVersion = versionMapper.findDefault();
        if (defaultVersion == null) {
            throw new BusinessException("SCRIPTURE_GENERATION_FAILED", "未找到可用圣经版本");
        }
        return defaultVersion;
    }

    private int getVerseCount(String type) {
        return switch (type) {
            case "verse_1" -> 1;
            case "verse_7" -> 7;
            case "verse_12" -> 12;
            case "verse_27" -> 27;
            case "verse_39" -> 39;
            default -> throw new BusinessException("VALIDATION_ERROR", "不支持的生成类型: " + type);
        };
    }
}
