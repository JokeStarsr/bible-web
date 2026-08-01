package com.bible.module.courtship.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 主内佳偶 - 心动意向表（A 对 B 表达心动，双向匹配后才能聊天）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourtshipLike {

    private UUID id;
    private UUID fromUserId;   // 发起方
    private UUID toUserId;     // 对方
    private String message;    // 心动附言
    private Boolean matched;   // 是否已互相心动（匹配成功）
    private LocalDateTime createdAt;
}
