package com.bible.module.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class LoginResponse {

    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private UserInfo user;

    @Data
    @AllArgsConstructor
    public static class UserInfo {
        private UUID id;
        private String username;
        private String displayName;
    }
}