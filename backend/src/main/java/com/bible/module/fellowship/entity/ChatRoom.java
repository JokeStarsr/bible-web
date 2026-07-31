package com.bible.module.fellowship.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 聊天室表
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoom {

    private UUID id;
    private String name;       // 群聊名称；单聊为 NULL
    private String type;       // DIRECT(单聊) / GROUP(群聊)
    private String avatarUrl;
    private UUID createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
