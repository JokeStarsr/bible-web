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
    /** 可见范围：PUBLIC=可共享，PRIVATE=仅自己看见 */
    private String visibility;
    private LocalDateTime createdAt;
}
