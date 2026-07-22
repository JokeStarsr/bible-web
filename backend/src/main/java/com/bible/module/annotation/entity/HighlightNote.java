package com.bible.module.annotation.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HighlightNote {

    private UUID id;
    private UUID userId;
    private UUID generationRecordId;
    private String referenceText;
    private UUID bookId;
    private int startChapter;
    private int startVerse;
    private int endChapter;
    private int endVerse;
    private String selectedText;
    private String highlightColor;
    private String noteContent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}