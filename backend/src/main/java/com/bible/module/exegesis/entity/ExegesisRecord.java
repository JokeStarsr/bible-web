package com.bible.module.exegesis.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExegesisRecord {

    private UUID id;
    private UUID generationRecordId;
    private UUID versionId;
    private String referenceText;
    private String sourceType;
    private String summary;
    private String historicalBackground;
    private String writingBackground;
    private String contextAnalysis;
    private String keywordAnalysis;
    private String canonicalPosition;
    private String theologicalTheme;
    private String truthForPeople;
    private String practicalApplication;
    private String referenceSources;
    private String status;
    private String aiModelName;
    private String promptVersion;
    private UUID reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}