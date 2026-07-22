package com.bible.module.scripture.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class GenerateScriptureResponse {

    private UUID generationRecordId;
    private String referenceText;
    private String generationType;
    private List<VerseItem> verses;

    @Data
    @Builder
    public static class VerseItem {
        private String bookName;
        private int chapterNumber;
        private int verseNumber;
        private String text;
    }
}