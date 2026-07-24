package com.bible.module.messaging.mapper;

import com.bible.module.messaging.entity.PrivateMessage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface PrivateMessageMapper {

    PrivateMessage findById(@Param("id") UUID id);

    int insert(PrivateMessage privateMessage);

    int markRead(@Param("id") UUID id);

    List<PrivateMessage> findBySessionId(@Param("sessionId") UUID sessionId,
                                         @Param("offset") int offset,
                                         @Param("limit") int limit);

    long countBySessionId(@Param("sessionId") UUID sessionId);
}