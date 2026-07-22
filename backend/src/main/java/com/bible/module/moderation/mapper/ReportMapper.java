package com.bible.module.moderation.mapper;

import com.bible.module.moderation.entity.Report;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ReportMapper {

    Report findById(UUID id);

    int insert(Report report);

    int updateStatus(UUID id, String status, UUID handledBy);

    List<Report> findAll(int offset, int limit);

    long countAll();
}