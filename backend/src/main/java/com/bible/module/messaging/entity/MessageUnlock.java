package com.bible.module.messaging.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageUnlock {

    private UUID id;
    private UUID reflectionId;
    private UUID userAId;
    private UUID userBId;
    private UUID triggerCommentId;
    private int triggerRoundCount;
    private String status;
    private LocalDateTime unlockedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}