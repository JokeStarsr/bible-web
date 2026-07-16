package com.bible.module.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private UUID id;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String bio;
    private String status;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}