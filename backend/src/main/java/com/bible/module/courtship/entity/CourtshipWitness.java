package com.bible.module.courtship.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 主内佳偶 - 见证分享表（成功配对后的婚姻/恋爱见证，需审核）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourtshipWitness {

    private UUID id;
    private UUID userId;       // 提交人
    private String title;      // 见证标题
    private String content;    // 见证内容
    private String photoUrl;   // 见证图片（可选）
    private String status;     // PENDING / APPROVED / REJECTED
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
