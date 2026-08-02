package com.bible.module.courtship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 见证响应
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WitnessResponse {

    private UUID id;
    private UUID userId;
    private String nickname;        // courtship_profiles.nickname，缺省回退 users.username
    private String title;
    private String content;
    private String photoUrl;
    private String status;
    private LocalDateTime createdAt;
}
