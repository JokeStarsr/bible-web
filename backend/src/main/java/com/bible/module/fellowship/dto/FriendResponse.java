package com.bible.module.fellowship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 好友列表项（含双方单聊房间及最近消息摘要）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendResponse {

    private UUID friendId;
    private String username;
    private String displayName;
    private String avatarUrl;
    private String status;
    private UUID roomId;                 // 双方单聊房间 id
    private String lastMessageContent;
    private LocalDateTime lastMessageAt;
    private int unreadCount;
}
