package com.bible.module.scripture.mapper;

import com.bible.module.scripture.entity.BibleBook;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface BibleBookMapper {

    BibleBook findById(UUID id);

    BibleBook findByVersionAndBookCode(UUID versionId, String bookCode);

    List<BibleBook> findByVersionId(UUID versionId);

    int countAll();

    List<BibleBook> findByIdIn(List<UUID> ids);
}