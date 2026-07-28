package com.bible.module.qt.mapper;

import com.bible.module.qt.entity.QtDailyContent;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Mapper
public interface QtDailyContentMapper {
    QtDailyContent findByDate(@Param("qtDate") LocalDate qtDate);
    QtDailyContent findById(@Param("id") UUID id);
    List<QtDailyContent> findAll(@Param("offset") int offset, @Param("size") int size);
    int countAll();
    void insert(QtDailyContent content);
    void update(QtDailyContent content);
}
