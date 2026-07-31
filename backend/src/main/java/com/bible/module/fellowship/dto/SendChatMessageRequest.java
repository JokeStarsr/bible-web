package com.bible.module.fellowship.dto;

import lombok.Data;

/**
 * 发送聊天消息请求
 * 注意：类名使用 Chat 前缀以避免与 messaging.dto.SendMessageRequest 的 MyBatis 类型别名冲突。
 */
@Data
public class SendChatMessageRequest {

    private String content;

    /** 消息类型：TEXT / IMAGE / AUDIO。为空按 TEXT 处理。 */
    private String type;
}
