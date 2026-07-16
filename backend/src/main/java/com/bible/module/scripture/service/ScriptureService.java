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

        // 随机打乱书卷顺序，尝试找到有足够经文的书卷（最多尝试10次）
        List<BibleBook> shuffled = new ArrayList<>(books);
        Collections.shuffle(shuffled, random);
        int maxTries = shuffled.size();

        for (int i = 0; i < maxTries; i++) {
            BibleBook book = shuffled.get(i);
            try {
                if ("chapter_full".equals(type)) {
                    int chapter = random.nextInt(book.getChapterCount()) + 1;
                    return generateChapter(userId, version, book, chapter);
                } else {
                    int verseCount = getVerseCount(type);
                    return generateVerses(userId, version, book, verseCount, type);
                }
            } catch (BusinessException e) {
                if (i == maxTries - 1) throw e;
                // 该书卷经文不足，尝试下一卷
            }
        }
        throw new BusinessException("SCRIPTURE_GENERATION_FAILED", "无可用的经文数据");
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
                                                      BibleBook book, int count, String type) {
        // 随机选择一个起始章节（1到该书的总章节数之间）
        int startChapter = random.nextInt(book.getChapterCount()) + 1;

        // 从起始章节开始，按连续章节号(ch, ch+1, ch+2, ...)收集经文
        // 如果某一章没有数据且不是起始章节，则停止收集（确保跨章连续性）
        List<List<BibleVerse>> chapterVersesList = new ArrayList<>();
        int totalFromStart = 0;
        int currentChapter = startChapter;
        while (totalFromStart < count && currentChapter <= book.getChapterCount()) {
            List<BibleVerse> cv = verseMapper.findByBookAndChapter(book.getId(), currentChapter);
            if (cv.isEmpty()) {
                // 如果当前章节无数据，且已经收集了数据（不是起始章节），则无法继续
                if (!chapterVersesList.isEmpty()) break;
                // 起始章节无数据，尝试下一章
                currentChapter++;
                continue;
            }
            chapterVersesList.add(cv);
            totalFromStart += cv.size();
            currentChapter++;
        }

        if (chapterVersesList.isEmpty() || totalFromStart < count) {
            throw new BusinessException("SCRIPTURE_GENERATION_FAILED", "该书卷从该章节起经文不足" + count + "节");
        }

        // 在起始章节中随机选择起始节（确保后续有足够的连续经文）
        List<BibleVerse> firstChapterVerses = chapterVersesList.get(0);
        int versesFromFirstChapter = Math.min(firstChapterVerses.size(), count);
        int maxStartOffset = firstChapterVerses.size() - versesFromFirstChapter;
        int startOffset = maxStartOffset > 0 ? random.nextInt(maxStartOffset + 1) : 0;

        // 确定实际起始章节（第一个有数据的章节）
        int actualStartChapter = firstChapterVerses.get(0).getChapterNumber();

        // 从 startOffset 开始收集连续经文
        List<BibleVerse> selectedVerses = new ArrayList<>();
        int collected = 0;
        int startVerseNumber = firstChapterVerses.get(startOffset).getVerseNumber();
        int endChapter = actualStartChapter;
        int endVerseNumber = startVerseNumber;

        // 从起始章节收集
        for (int j = startOffset; j < firstChapterVerses.size() && collected < count; j++) {
            selectedVerses.add(firstChapterVerses.get(j));
            collected++;
            endChapter = actualStartChapter;
            endVerseNumber = firstChapterVerses.get(j).getVerseNumber();
        }

        // 从后续章节继续收集
        for (int i = 1; i < chapterVersesList.size() && collected < count; i++) {
            List<BibleVerse> cv = chapterVersesList.get(i);
            for (BibleVerse v : cv) {
                if (collected >= count) break;
                selectedVerses.add(v);
                collected++;
                endChapter = v.getChapterNumber();
                endVerseNumber = v.getVerseNumber();
            }
        }

        // 构建引用文本（使用实际起始章节，而非随机选择的章节号）
        String referenceText;
        if (actualStartChapter == endChapter) {
            referenceText = String.format("%s %d:%d-%d",
                    book.getBookNameZh(), actualStartChapter, startVerseNumber, endVerseNumber);
        } else {
            referenceText = String.format("%s %d:%d-%d:%d",
                    book.getBookNameZh(), actualStartChapter, startVerseNumber, endChapter, endVerseNumber);
        }

        return buildResponse(userId, version, book, actualStartChapter, startVerseNumber,
                endChapter, endVerseNumber, type, referenceText, selectedVerses);
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