package com.bible.module.scripture.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScriptureGenerationRecord {

    private UUID id;
    private UUID userId;
    private UUID versionId;
    private String generationType;
    private UUID bookId;
    private int startChapter;
    private Integer startVerse;
    private int endChapter;
    private Integer endVerse;
    private String referenceText;
    private int verseCount;
    private LocalDateTime createdAt;
}