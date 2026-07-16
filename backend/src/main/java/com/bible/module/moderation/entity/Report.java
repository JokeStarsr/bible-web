package com.bible.module.moderation.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    private UUID id;
    private UUID reporterId;
    private String targetType;
    private UUID targetId;
    private String reasonCode;
    private String reasonDetail;
    private String status;
    private UUID handledBy;
    private LocalDateTime handledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}