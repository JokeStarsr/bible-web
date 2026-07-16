package com.bible.module.reflection.mapper;

import com.bible.module.reflection.entity.Reflection;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ReflectionMapper {

    Reflection findById(UUID id);

    int insert(Reflection reflection);

    int update(Reflection reflection);

    int deleteById(UUID id);

    List<Reflection> findByUserId(UUID userId, int offset, int limit);

    long countByUserId(UUID userId);

    List<Reflection> findPublic(int offset, int limit);

    long countPublic();
}