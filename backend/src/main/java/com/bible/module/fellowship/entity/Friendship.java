package com.bible.module.fellowship.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 好友关系表（合并好友请求，用 status 区分）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Friendship {

    private UUID id;
    private UUID userId;       // 发起方
    private UUID friendId;     // 接收方
    private String status;     // PENDING / ACCEPTED / REJECTED
    private String message;    // 好友请求附言
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
