package com.bible.module.messaging.mapper;

import com.bible.module.messaging.entity.PrivateMessageSession;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface PrivateMessageSessionMapper {

    PrivateMessageSession findById(UUID id);

    int insert(PrivateMessageSession privateMessageSession);

    int updateStatus(UUID id, String status);

    int updateLastMessage(UUID id);

    List<PrivateMessageSession> findByUserId(UUID userId, int offset, int limit);

    long countByUserId(UUID userId);
}