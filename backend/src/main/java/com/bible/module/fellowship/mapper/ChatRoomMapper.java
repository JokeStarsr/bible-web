package com.bible.module.fellowship.mapper;

import com.bible.module.fellowship.dto.RoomResponse;
import com.bible.module.fellowship.entity.ChatRoom;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ChatRoomMapper {

    void insert(ChatRoom room);

    ChatRoom findById(@Param("id") UUID id);

    /** 查询两人之间的单聊房间 */
    ChatRoom findDirectRoomByUsers(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);

    /** 查询用户的所有群聊房间（含摘要与未读数） */
    List<RoomResponse> findGroupRoomsByUserId(@Param("userId") UUID userId);
}
