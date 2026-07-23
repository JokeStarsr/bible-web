package com.bible.module.praise.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PraiseTrack {

    private UUID id;
    private String title;
    private String artistName;
    private String coverImageUrl;
    private String audioUrl;
    private Integer durationSeconds;
    private String lyrics;
    private String externalUrl;
    private String sourceType;
    private String copyrightNote;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}