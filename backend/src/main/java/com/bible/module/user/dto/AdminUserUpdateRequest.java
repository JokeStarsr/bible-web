package com.bible.module.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * 管理员更新用户请求（所有字段可选，仅更新非 null 字段）
 */
@Data
public class AdminUserUpdateRequest {

    @Pattern(regexp = "^[A-Za-z0-9_]{3,32}$", message = "用户名只能包含字母、数字和下划线，长度3-32")
    private String username;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String displayName;

    private String bio;

    /** active | suspended | disabled */
    private String status;
}
