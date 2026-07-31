package com.bible.module.fellowship.mapper;

import com.bible.module.fellowship.dto.RoomMemberResponse;
import com.bible.module.fellowship.entity.ChatRoomMember;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface ChatRoomMemberMapper {

    void insert(ChatRoomMember member);

    /** 房间成员列表（JOIN users 取用户信息） */
    List<RoomMemberResponse> findRoomMembersWithUserInfo(@Param("roomId") UUID roomId);

    ChatRoomMember findByRoomAndUser(@Param("roomId") UUID roomId, @Param("userId") UUID userId);

    int updateLastReadAt(@Param("roomId") UUID roomId, @Param("userId") UUID userId);

    int deleteByRoomAndUser(@Param("roomId") UUID roomId, @Param("userId") UUID userId);

    /** 房间所有成员 userId（用于 WebSocket 推送） */
    List<UUID> findMemberUserIds(@Param("roomId") UUID roomId);
}
