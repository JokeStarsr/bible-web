package com.bible.module.qt.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QtDailyContent {
    private UUID id;
    private LocalDate qtDate;
    private String title;
    private String scriptureReference;
    private String scriptureText;
    private String commentary;
    private String hymn;
    private String titleKo;
    private String scriptureReferenceKo;
    private String scriptureTextKo;
    private String commentaryKo;
    private String hymnKo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
