package com.bible.module.contact.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.config.MailService;
import com.bible.module.contact.dto.PastorContactRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
public class PastorContactController {

    private final MailService mailService;

    @PostMapping("/pastor")
    public ApiResponse<Void> contactPastor(@Valid @RequestBody PastorContactRequest req) {
        String emailContent = buildEmailContent(req);
        boolean sent = mailService.sendPastorContactEmail(emailContent);
        if (!sent) {
            log.warn("邮件服务未配置，联系牧者表单内容未发送，表单内容：\n{}", emailContent);
        }
        return ApiResponse.ok("您的信息已提交至刘牧师处，晚些时候会跟您联系，请保持以上通讯方式畅通。", null);
    }

    private String buildEmailContent(PastorContactRequest req) {
        return String.format("""
                有人通过「圣经灵修」网站提交联系牧者信息：

                姓名：%s
                性别：%s
                微信名：%s
                手机号：%s
                邮箱：%s
                当前居住地：%s
                """,
                req.getName(),
                req.getGender(),
                req.getWechatName() == null || req.getWechatName().isBlank() ? "（未填写）" : req.getWechatName(),
                req.getPhone() == null || req.getPhone().isBlank() ? "（未填写）" : req.getPhone(),
                req.getEmail(),
                req.getLocation());
    }
}
