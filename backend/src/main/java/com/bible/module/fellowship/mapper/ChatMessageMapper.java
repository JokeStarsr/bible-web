package com.bible.module.fellowship.mapper;

import com.bible.module.fellowship.dto.ChatMessageResponse;
import com.bible.module.fellowship.entity.ChatMessage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ChatMessageMapper {

    void insert(ChatMessage message);

    /** 分页查询房间消息（按 created_at DESC，JOIN users 取发送者信息） */
    List<ChatMessageResponse> findByRoomId(@Param("roomId") UUID roomId,
                                       @Param("offset") int offset,
                                       @Param("size") int size);

    int countByRoomId(@Param("roomId") UUID roomId);

    /** 房间最后一条消息 */
    ChatMessage findLastMessageByRoomId(@Param("roomId") UUID roomId);

    /** 用户在房间的未读消息数（created_at > last_read_at） */
    int countUnread(@Param("roomId") UUID roomId, @Param("userId") UUID userId);

    /** 根据 ID 查询单条消息 */
    ChatMessage findById(@Param("id") UUID id);

    /** 根据 ID 删除单条消息 */
    int deleteById(@Param("id") UUID id);
}
