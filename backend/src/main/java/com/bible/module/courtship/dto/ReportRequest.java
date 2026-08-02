package com.bible.module.courtship.dto;

import lombok.Data;

import java.util.UUID;

/**
 * 举报请求
 */
@Data
public class ReportRequest {

    private UUID reportedId;
    private String reason;          // INAPPROPRIATE / FAKE / SPAM / OTHER
    private String detail;
}
