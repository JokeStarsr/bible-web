package com.bible.module.fellowship.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 聊天室成员表
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatRoomMember {

    private UUID id;
    private UUID roomId;
    private UUID userId;
    private LocalDateTime lastReadAt;   // 最后已读时间，用于未读计数
    private LocalDateTime joinedAt;
}
