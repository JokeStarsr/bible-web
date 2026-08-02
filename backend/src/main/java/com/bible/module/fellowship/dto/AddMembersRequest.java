package com.bible.module.fellowship.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * 拉人进群请求
 */
@Data
public class AddMembersRequest {

    /** 被邀请加入群聊的用户ID列表 */
    private List<UUID> memberIds;
}
