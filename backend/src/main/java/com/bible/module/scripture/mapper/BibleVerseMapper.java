package com.bible.module.scripture.mapper;

import com.bible.module.scripture.entity.BibleVerse;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface BibleVerseMapper {

    BibleVerse findById(UUID id);

    List<BibleVerse> findByBookAndChapter(UUID bookId, int chapter);

    List<BibleVerse> findByRange(UUID bookId, int startChapter, int startVerse, int endChapter, int endVerse);

    int countByBookAndChapter(UUID bookId, int chapter);

    int countByBookId(UUID bookId);

    List<Integer> findChaptersByBookId(UUID bookId);
}