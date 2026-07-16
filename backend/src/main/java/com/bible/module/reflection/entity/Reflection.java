package com.bible.module.reflection.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reflection {

    private UUID id;
    private UUID userId;
    private UUID generationRecordId;
    private String referenceText;
    private String title;
    private String content;
    private String visibility;
    private String status;
    private LocalDateTime draftSavedAt;
    private LocalDateTime publishedAt;
    private int commentCount;
    private int likeCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}