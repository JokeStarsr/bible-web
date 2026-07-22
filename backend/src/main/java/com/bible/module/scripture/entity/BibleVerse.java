package com.bible.module.scripture.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BibleVerse {

    private UUID id;
    private UUID versionId;
    private UUID bookId;
    private int chapterNumber;
    private int verseNumber;
    private String verseText;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}