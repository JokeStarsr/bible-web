package com.bible.module.dailythought.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyThoughtRecord {

    private UUID id;
    private UUID userId;
    private String content;
    private String pastoralResponse;
    private String divineWord;
    private String hymn;
    private String scriptures;
    private LocalDateTime createdAt;
}
