package com.bible.module.exegesis.mapper;

import com.bible.module.exegesis.entity.ExegesisRecord;
import org.apache.ibatis.annotations.Mapper;

import java.util.UUID;

@Mapper
public interface ExegesisRecordMapper {

    ExegesisRecord findById(UUID id);

    ExegesisRecord findByGenerationRecordId(UUID generationRecordId);

    ExegesisRecord findByReferenceText(String referenceText);

    int insert(ExegesisRecord exegesisRecord);

    int update(ExegesisRecord exegesisRecord);
}