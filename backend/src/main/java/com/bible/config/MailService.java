package com.bible.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Profile("!dev")
@RequiredArgsConstructor
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    /**
     * 发送注册验证码。
     * @return true 表示邮件发送成功；false 表示发送失败（如 SMTP 未配置），调用方可据此回退为直接返回验证码。
     */
    public boolean sendVerificationCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("圣经灵修 - 邮箱验证码");
        message.setText("您的验证码是：" + code + "，有效期5分钟。请勿将验证码泄露给他人。");
        try {
            mailSender.send(message);
            log.info("验证码已发送至 {}", to);
            return true;
        } catch (Exception e) {
            log.warn("邮件发送失败: {}，验证码: {}", e.getMessage(), code);
            return false;
        }
    }

    /**
     * 发送密码重置验证码。
     * @return true 表示邮件发送成功；false 表示发送失败，调用方可据此回退为直接返回验证码。
     */
    public boolean sendPasswordResetCode(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("圣经灵修 - 密码重置验证码");
        message.setText("您的密码重置验证码是：" + code + "，有效期5分钟。如非本人操作，请忽略此邮件。");
        try {
            mailSender.send(message);
            log.info("重置密码验证码已发送至 {}", to);
            return true;
        } catch (Exception e) {
            log.warn("邮件发送失败: {}，验证码: {}", e.getMessage(), code);
            return false;
        }
    }
}