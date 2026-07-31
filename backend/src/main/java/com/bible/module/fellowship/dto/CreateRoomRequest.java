package com.bible.module.fellowship.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * 创建群聊请求
 */
@Data
public class CreateRoomRequest {

    private String name;
    private List<UUID> memberIds;
}
