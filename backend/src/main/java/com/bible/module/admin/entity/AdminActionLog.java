package com.bible.module.admin.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminActionLog {

    private UUID id;
    private UUID adminUserId;
    private String actionType;
    private String targetType;
    private UUID targetId;
    private String actionDetail;
    private LocalDateTime createdAt;
}