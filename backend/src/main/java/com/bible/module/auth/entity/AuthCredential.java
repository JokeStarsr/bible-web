package com.bible.module.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthCredential {

    private UUID id;
    private UUID userId;
    private String passwordHash;
    private LocalDateTime passwordUpdatedAt;
    private int failedLoginCount;
    private LocalDateTime lockedUntil;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}