package com.bible.module.dailythought.mapper;

import com.bible.module.dailythought.entity.DailyThoughtRecord;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface DailyThoughtRecordMapper {

    int insert(DailyThoughtRecord record);

    List<DailyThoughtRecord> findByUserId(UUID userId, int offset, int limit);

    long countByUserId(UUID userId);
}
