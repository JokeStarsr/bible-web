package com.bible.module.fellowship.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 聊天消息表
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    private UUID id;
    private UUID roomId;
    private UUID senderId;
    private String content;
    private String type;       // 预留：TEXT/IMAGE等
    private LocalDateTime createdAt;
}
