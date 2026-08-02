package com.bible.module.courtship.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 主内佳偶 - 匹配关系表（互相心动后建立，关联 chat_rooms 复用聊天功能）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourtshipMatch {

    private UUID id;
    private UUID userAId;    // 较小 userId 的一方
    private UUID userBId;    // 较大 userId 的一方
    private UUID roomId;     // 关联聊天室（单聊）
    private String status;   // ACTIVE(正常) / DISSOLVED(解除)
    private LocalDateTime createdAt;
}
