package com.bible.module.discussion.mapper;

import com.bible.module.discussion.entity.ReflectionComment;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ReflectionCommentMapper {

    ReflectionComment findById(UUID id);

    int insert(ReflectionComment reflectionComment);

    int deleteById(UUID id);

    List<ReflectionComment> findByReflectionId(UUID reflectionId, int offset, int limit);

    long countByReflectionId(UUID reflectionId);

    int countInteractionsBetween(UUID reflectionId, UUID userA, UUID userB);
}