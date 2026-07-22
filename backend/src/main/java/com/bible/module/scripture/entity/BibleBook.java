package com.bible.module.scripture.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BibleBook {

    private UUID id;
    private UUID versionId;
    private int bookOrder;
    private String bookCode;
    private String bookNameZh;
    private String bookNameEn;
    private String testament;
    private int chapterCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}