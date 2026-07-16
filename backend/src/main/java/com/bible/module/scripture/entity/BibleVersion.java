package com.bible.module.scripture.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BibleVersion {

    private UUID id;
    private String code;
    private String name;
    private String language;
    private String copyrightNotice;
    private boolean isDefault;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}