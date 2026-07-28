package com.bible.module.qt.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class QtUserResponseDTO {
    private UUID id;
    private UUID userId;
    private String username;
    private String displayName;
    private String meditation;
    private String application;
    private String prayer;
    private List<String> photos;
    private LocalDateTime createdAt;
}
