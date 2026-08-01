package com.bible.module.courtship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 匹配列表项
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {

    private UUID id;
    private UUID otherUserId;
    private String otherNickname;   // courtship_profiles.nickname，缺省回退 users.username
    private String otherAvatarUrl;  // users.avatar_url
    private UUID roomId;
    private String status;
    private LocalDateTime createdAt;
}
