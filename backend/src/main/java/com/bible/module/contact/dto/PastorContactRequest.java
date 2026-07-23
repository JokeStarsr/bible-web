package com.bible.module.contact.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PastorContactRequest {

    @NotBlank(message = "姓名不能为空")
    @Size(max = 50, message = "姓名不能超过50个字符")
    private String name;

    @NotBlank(message = "性别不能为空")
    @Pattern(regexp = "^(男|女|其他)$", message = "性别只能是男、女或其他")
    private String gender;

    @Size(max = 50, message = "微信名不能超过50个字符")
    private String wechatName;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "请输入有效的手机号")
    private String phone;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "请输入有效的邮箱地址")
    @Size(max = 100, message = "邮箱不能超过100个字符")
    private String email;

    @NotBlank(message = "当前居住地不能为空")
    @Size(max = 200, message = "当前居住地不能超过200个字符")
    private String location;
}
