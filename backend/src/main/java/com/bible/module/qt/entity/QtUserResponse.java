package com.bible.module.qt.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QtUserResponse {
    private UUID id;
    private UUID userId;
    private UUID qtContentId;
    private String meditation;
    private String application;
    private String prayer;
    private String photos;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
