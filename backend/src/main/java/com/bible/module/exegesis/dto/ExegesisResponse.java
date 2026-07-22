package com.bible.module.exegesis.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ExegesisResponse {

    private UUID exegesisRecordId;
    private String referenceText;
    private String summary;
    private String historicalBackground;
    private String writingBackground;
    private String contextAnalysis;
    private List<KeywordItem> keywordAnalysis;
    private String canonicalPosition;
    private String theologicalTheme;
    private String truthForPeople;
    private String practicalApplication;

    @Data
    @Builder
    public static class KeywordItem {
        private String keyword;
        private String explanation;
    }
}