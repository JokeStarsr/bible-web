package com.bible.module.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WechatLoginRequest {

    @NotBlank(message = "code不能为空")
    private String code;

    /** 微信用户昵称（可选，首次登录时前端传入） */
    private String nickName;

    /** 微信用户头像URL（可选） */
    private String avatarUrl;
}
