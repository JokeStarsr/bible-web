package com.bible.module.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 管理员视角的用户信息（含登录凭据状态）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {

    private UUID id;
    private String username;
    private String email;
    private String displayName;
    private String avatarUrl;
    private String bio;
    private String status;
    /** 是否已设置密码（用于判断微信-only 账号） */
    private Boolean hasPassword;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
