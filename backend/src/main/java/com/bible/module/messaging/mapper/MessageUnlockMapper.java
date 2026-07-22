package com.bible.module.messaging.mapper;

import com.bible.module.messaging.entity.MessageUnlock;
import org.apache.ibatis.annotations.Mapper;

import java.util.UUID;

@Mapper
public interface MessageUnlockMapper {

    MessageUnlock findById(UUID id);

    int insert(MessageUnlock messageUnlock);

    int updateStatus(UUID id, String status);

    MessageUnlock findByReflectionAndUsers(UUID reflectionId, UUID userA, UUID userB);
}