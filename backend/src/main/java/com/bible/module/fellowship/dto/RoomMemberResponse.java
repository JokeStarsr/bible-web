package com.bible.module.fellowship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 房间成员响应
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomMemberResponse {

    private UUID userId;
    private String username;
    private String displayName;
    private String avatarUrl;
}
