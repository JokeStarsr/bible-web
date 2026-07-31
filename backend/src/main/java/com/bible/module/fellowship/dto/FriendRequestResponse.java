package com.bible.module.fellowship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 好友请求响应（收到的待处理请求）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequestResponse {

    private UUID id;
    private UUID fromUserId;
    private String fromUsername;
    private String fromAvatarUrl;
    private String message;
    private String status;
    private LocalDateTime createdAt;
}
