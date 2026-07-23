package com.bible.module.scripture.service;

import com.bible.common.exception.BusinessException;
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

    private final Random random = new Random();

    @Transactional
    public GenerateScriptureResponse generate(UUID userId, GenerateScriptureRequest req) {
        BibleVersion version = getVersion(req.getVersionCode());
        List<BibleBook> books = bookMapper.findByVersionId(version.getId());
        if (books.isEmpty()) {
            throw new BusinessException("SCRIPTURE_GENERATION_FAILED", "圣经数据未就绪");
        }

        String type = req.getGenerationType();

        if ("chapter_full".equals(type)) {
            // 随机打乱书卷顺序，尝试找到有完整章经文的书卷
            List<BibleBook> shuffled = new ArrayList<>(books);
            Collections.shuffle(shuffled, random);
            for (BibleBook book : shuffled) {
                int chapter = random.nextInt(book.getChapterCount()) + 1;
                List<BibleVerse> verses = verseMapper.findByBookAndChapter(book.getId(), chapter);
                if (!verses.isEmpty()) {
                    return generateChapter(userId, version, book, chapter);
                }
            }
            throw new BusinessException("SCRIPTURE_GENERATION_FAILED", "无可用的完整章节数据");
        } else {
            int verseCount = getVerseCount(type);
            return generateVerses(userId, version, verseCount, type);
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

        return buildResponse(userId, version, book, chapter, verses.get(0).getVerseNumber(),
                chapter, verses.get(verses.size() - 1).getVerseNumber(),
                "chapter_full", referenceText, verses);
    }

    private GenerateScriptureResponse generateVerses(UUID userId, BibleVersion version,
                                                      int count, String type) {
        // 构建全局经文池：按圣经书卷顺序 -> 章节号 -> 节号 排序
        List<BibleBook> allBooks = bookMapper.findByVersionId(version.getId());
        allBooks.sort(Comparator.comparingInt(BibleBook::getBookOrder));

        List<BibleVerse> globalPool = new ArrayList<>();
        for (BibleBook b : allBooks) {
            List<Integer> chapters = verseMapper.findChaptersByBookId(b.getId());
            for (int ch : chapters) {
                List<BibleVerse> verses = verseMapper.findByBookAndChapter(b.getId(), ch);
                globalPool.addAll(verses);
            }
        }

        if (globalPool.isEmpty()) {
            throw new BusinessException("SCRIPTURE_GENERATION_FAILED", "圣经数据未就绪");
        }

        // 如果总经文数不足 count，返回全部可用经文
        if (globalPool.size() <= count) {
            return buildVersesResponse(userId, version, type, globalPool);
        }

        // 随机选择一个起始位置，连续取 count 节（允许跨章节、跨书卷循环）
        int startIndex = random.nextInt(globalPool.size());
        List<BibleVerse> selected = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            int idx = (startIndex + i) % globalPool.size();
            selected.add(globalPool.get(idx));
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
        BibleBook firstBook = bookMapper.findById(first.getBookId());
        BibleBook lastBook = bookMapper.findById(last.getBookId());

        String referenceText;
        if (firstBook.getId().equals(lastBook.getId())) {
            // 同一书卷
            if (first.getChapterNumber() == last.getChapterNumber()) {
                referenceText = String.format("%s %d:%d-%d",
                        firstBook.getBookNameZh(), first.getChapterNumber(),
                        first.getVerseNumber(), last.getVerseNumber());
            } else {
                referenceText = String.format("%s %d:%d-%d:%d",
                        firstBook.getBookNameZh(), first.getChapterNumber(),
                        first.getVerseNumber(), last.getChapterNumber(), last.getVerseNumber());
            }
        } else {
            // 跨书卷
            referenceText = String.format("%s %d:%d - %s %d:%d",
                    firstBook.getBookNameZh(), first.getChapterNumber(), first.getVerseNumber(),
                    lastBook.getBookNameZh(), last.getChapterNumber(), last.getVerseNumber());
        }

        return buildResponse(userId, version, firstBook,
                first.getChapterNumber(), first.getVerseNumber(),
                last.getChapterNumber(), last.getVerseNumber(),
                type, referenceText, verses);
    }

    private GenerateScriptureResponse buildResponse(UUID userId, BibleVersion version,
                                                     BibleBook book, int startChapter, int startVerse,
                                                     int endChapter, int endVerse, String type,
                                                     String referenceText, List<BibleVerse> verses) {
        // 保存生成记录
        ScriptureGenerationRecord record = new ScriptureGenerationRecord();
        record.setId(UUID.randomUUID());
        record.setUserId(userId);
        record.setVersionId(version.getId());
        record.setGenerationType(type);
        record.setBookId(book.getId());
        record.setStartChapter(startChapter);
        record.setStartVerse(startVerse);
        record.setEndChapter(endChapter);
        record.setEndVerse(endVerse);
        record.setReferenceText(referenceText);
        record.setVerseCount(verses.size());
        record.setCreatedAt(LocalDateTime.now());
        generationRecordMapper.insert(record);

        List<GenerateScriptureResponse.VerseItem> items = verses.stream()
                .map(v -> GenerateScriptureResponse.VerseItem.builder()
                        .bookName(book.getBookNameZh())
                        .chapterNumber(v.getChapterNumber())
                        .verseNumber(v.getVerseNumber())
                        .text(v.getVerseText())
                        .build())
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