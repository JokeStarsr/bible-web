package com.bible.module.annotation.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerseBookmark {

    private UUID id;
    private UUID userId;
    private UUID versionId;
    private UUID bookId;
    private int chapterNumber;
    private int verseNumber;
    private LocalDateTime createdAt;
}
