package com.bible.module.messaging.mapper;

import com.bible.module.messaging.entity.PrivateMessageSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface PrivateMessageSessionMapper {

    PrivateMessageSession findById(@Param("id") UUID id);

    PrivateMessageSession findByUsers(@Param("userAId") UUID userAId, @Param("userBId") UUID userBId);

    int insert(PrivateMessageSession privateMessageSession);

    int updateStatus(@Param("id") UUID id, @Param("status") String status);

    int updateLastMessage(@Param("id") UUID id);

    List<PrivateMessageSession> findByUserId(@Param("userId") UUID userId,
                                             @Param("offset") int offset,
                                             @Param("limit") int limit);

    long countByUserId(@Param("userId") UUID userId);
}