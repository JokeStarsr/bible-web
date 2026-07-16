package com.bible.module.scripture.mapper;

import com.bible.module.scripture.entity.ScriptureGenerationRecord;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ScriptureGenerationRecordMapper {

    ScriptureGenerationRecord findById(UUID id);

    int insert(ScriptureGenerationRecord scriptureGenerationRecord);

    List<ScriptureGenerationRecord> findByUserId(UUID userId, int offset, int limit);

    long countByUserId(UUID userId);
}