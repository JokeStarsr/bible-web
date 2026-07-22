package com.bible.module.scripture.mapper;

import com.bible.module.scripture.entity.BibleVersion;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface BibleVersionMapper {

    BibleVersion findById(UUID id);

    BibleVersion findByCode(String code);

    BibleVersion findDefault();

    List<BibleVersion> findAll();
}