package com.bible.module.courtship.mapper;

import com.bible.module.courtship.entity.CourtshipReport;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CourtshipReportMapper {

    void insert(CourtshipReport report);
}
