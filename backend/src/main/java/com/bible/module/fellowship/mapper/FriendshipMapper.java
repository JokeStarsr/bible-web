package com.bible.module.fellowship.mapper;

import com.bible.module.fellowship.dto.FriendRequestResponse;
import com.bible.module.fellowship.dto.FriendResponse;
import com.bible.module.fellowship.entity.Friendship;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface FriendshipMapper {

    void insert(Friendship friendship);

    int updateStatus(@Param("id") UUID id, @Param("status") String status);

    Friendship findById(@Param("id") UUID id);

    /** 收到的待处理好友请求（JOIN users 取发起方信息） */
    List<FriendRequestResponse> findPendingByFriendId(@Param("friendId") UUID friendId);

    /** 已是好友的用户 id 列表（双向，返回对方 id） */
    List<UUID> findAcceptedFriendIds(@Param("userId") UUID userId);

    /** 好友列表（双向，含单聊房间与最近消息摘要、未读数） */
    List<FriendResponse> findFriends(@Param("userId") UUID userId);

    /** 查两人间是否已存在好友关系记录（双向） */
    Friendship findExisting(@Param("userId") UUID userId, @Param("friendId") UUID friendId);

    /** 删除两人间的好友关系（双向） */
    int deleteFriendship(@Param("userId") UUID userId, @Param("friendId") UUID friendId);
}
