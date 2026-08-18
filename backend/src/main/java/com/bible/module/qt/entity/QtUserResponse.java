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
    /** 可见范围：PUBLIC=可共享（其他用户可见），PRIVATE=仅自己看见 */
    private String visibility;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
