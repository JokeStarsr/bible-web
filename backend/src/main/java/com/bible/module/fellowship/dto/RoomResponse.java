package com.bible.module.fellowship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 聊天房间响应（群聊列表项，含最近消息摘要与未读数）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {

    private UUID id;
    private String name;
    private String type;
    private String avatarUrl;
    private int memberCount;
    private String lastMessageContent;
    private LocalDateTime lastMessageAt;
    private String lastMessageSenderName;
    private int unreadCount;
}
