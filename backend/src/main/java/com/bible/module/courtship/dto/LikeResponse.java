package com.bible.module.courtship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 心动列表项（我发出过的心动）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LikeResponse {

    private UUID id;
    private UUID toUserId;
    private String toNickname;      // courtship_profiles.nickname，缺省回退 users.username
    private String toAvatarUrl;     // users.avatar_url
    private String message;
    private Boolean matched;
    private LocalDateTime createdAt;
}
