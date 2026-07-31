package com.bible.module.fellowship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 聊天消息响应（含发送者信息）
 * 注意：类名使用 Chat 前缀以避免与 messaging.dto.MessageResponse 的 MyBatis 类型别名冲突。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {

    private UUID id;
    private UUID roomId;
    private UUID senderId;
    private String senderName;
    private String senderAvatarUrl;
    private String content;
    private String type;
    private LocalDateTime createdAt;
}
