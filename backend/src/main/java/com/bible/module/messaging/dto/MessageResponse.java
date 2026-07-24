package com.bible.module.messaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {

    private UUID id;
    private UUID sessionId;
    private UUID senderId;
    private String content;
    private String status;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
