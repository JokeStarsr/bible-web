package com.bible.module.fellowship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * 用户搜索响应（标记是否已是好友）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatUserSearchResponse {

    private UUID userId;
    private String username;
    private String displayName;
    private String avatarUrl;
    private boolean isFriend;
}
