package com.bible.module.fellowship.dto;

import lombok.Data;

/**
 * 发送好友请求
 */
@Data
public class SendFriendRequest {

    /** 目标用户的用户名或邮箱 */
    private String friendIdentifier;

    /** 好友请求附言 */
    private String message;
}
