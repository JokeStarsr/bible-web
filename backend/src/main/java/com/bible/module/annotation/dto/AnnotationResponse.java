package com.bible.module.annotation.dto;

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
public class AnnotationResponse {

    private UUID id;
    private UUID userId;
    private UUID versionId;
    private UUID bookId;
    private int chapterNumber;
    private int startVerse;
    private int endVerse;
    private String selectedText;
    private String noteContent;
    private String visibility;
    private AuthorInfo author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorInfo {
        private UUID id;
        private String displayName;
        private String avatarUrl;
    }
}
