package com.bible.module.discussion.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReflectionComment {

    private UUID id;
    private UUID reflectionId;
    private UUID userId;
    private UUID parentCommentId;
    private UUID rootCommentId;
    private String content;
    private String status;
    private Integer interactionRoundSeq;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}