package com.bible.module.courtship.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 主内佳偶 - 举报表
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourtshipReport {

    private UUID id;
    private UUID reporterId;  // 举报人
    private UUID reportedId;  // 被举报人
    private String reason;    // INAPPROPRIATE / FAKE / SPAM / OTHER
    private String detail;    // 详细说明
    private String status;    // PENDING / RESOLVED
    private LocalDateTime createdAt;
}
