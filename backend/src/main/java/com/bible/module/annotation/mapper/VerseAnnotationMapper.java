package com.bible.module.annotation.mapper;

import com.bible.module.annotation.entity.VerseAnnotation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface VerseAnnotationMapper {

    VerseAnnotation findById(@Param("id") UUID id);

    int insert(VerseAnnotation annotation);

    int update(VerseAnnotation annotation);

    int deleteById(@Param("id") UUID id);

    List<VerseAnnotation> findByUserId(@Param("userId") UUID userId,
                                       @Param("offset") int offset,
                                       @Param("limit") int limit);

    List<VerseAnnotation> findByUserAndChapter(@Param("userId") UUID userId,
                                               @Param("versionId") UUID versionId,
                                               @Param("bookId") UUID bookId,
                                               @Param("chapterNumber") int chapterNumber);

    List<VerseAnnotation> findPublicByChapter(@Param("versionId") UUID versionId,
                                              @Param("bookId") UUID bookId,
                                              @Param("chapterNumber") int chapterNumber);

    long countByUserId(@Param("userId") UUID userId);
}
