package com.bible.module.messaging.mapper;

import com.bible.module.messaging.entity.PrivateMessage;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface PrivateMessageMapper {

    PrivateMessage findById(UUID id);

    int insert(PrivateMessage privateMessage);

    int markRead(UUID id);

    List<PrivateMessage> findBySessionId(UUID sessionId, int offset, int limit);

    long countBySessionId(UUID sessionId);
}