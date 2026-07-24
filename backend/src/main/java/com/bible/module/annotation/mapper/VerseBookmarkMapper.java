package com.bible.module.annotation.mapper;

import com.bible.module.annotation.entity.VerseBookmark;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface VerseBookmarkMapper {

    VerseBookmark findById(@Param("id") UUID id);

    VerseBookmark findByUserAndVerse(@Param("userId") UUID userId,
                                     @Param("versionId") UUID versionId,
                                     @Param("bookId") UUID bookId,
                                     @Param("chapterNumber") int chapterNumber,
                                     @Param("verseNumber") int verseNumber);

    int insert(VerseBookmark bookmark);

    int deleteById(@Param("id") UUID id);

    int deleteByUserAndVerse(@Param("userId") UUID userId,
                             @Param("versionId") UUID versionId,
                             @Param("bookId") UUID bookId,
                             @Param("chapterNumber") int chapterNumber,
                             @Param("verseNumber") int verseNumber);

    List<VerseBookmark> findByUserId(@Param("userId") UUID userId,
                                     @Param("offset") int offset,
                                     @Param("limit") int limit);

    long countByUserId(@Param("userId") UUID userId);
}
