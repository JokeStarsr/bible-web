package com.bible.module.annotation.mapper;

import com.bible.module.annotation.entity.HighlightNote;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface HighlightNoteMapper {

    HighlightNote findById(UUID id);

    int insert(HighlightNote highlightNote);

    int update(HighlightNote highlightNote);

    int deleteById(UUID id);

    List<HighlightNote> findByUserId(UUID userId, int offset, int limit);

    long countByUserId(UUID userId);
}