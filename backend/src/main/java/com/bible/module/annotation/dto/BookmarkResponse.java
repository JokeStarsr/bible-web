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
public class BookmarkResponse {

    private UUID id;
    private UUID versionId;
    private UUID bookId;
    private int chapterNumber;
    private int verseNumber;
    private LocalDateTime createdAt;
    private boolean bookmarked;
}
