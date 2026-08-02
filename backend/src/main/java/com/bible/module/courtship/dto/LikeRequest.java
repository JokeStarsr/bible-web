package com.bible.module.courtship.dto;

import lombok.Data;

import java.util.UUID;

/**
 * 心动请求
 */
@Data
public class LikeRequest {

    private UUID toUserId;
    private String message;
}
