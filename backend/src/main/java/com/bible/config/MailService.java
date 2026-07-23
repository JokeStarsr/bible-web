package com.bible.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@Profile("!dev")
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    private boolean mailConfigured = false;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @PostConstruct
    public void init() {
        mailConfigured = StringUtils.hasText(from);
        if (mailConfigured) {
            log.info("邮件服务已配置，发件人: {}", from);
        } else {
            log.warn("邮件服务未配置：spring.mail.username 为空，邮件发送将失败");
        }
    }

    /**
     * 发送注册验证码。
     * @return true 表示邮件发送成功；false 表示发送失败（如 SMTP 未配置），调用方可据此回退为直接返回验证码。
     */
    public boolean sendVerificationCode(String to, String code) {
        if (!mailConfigured) {
            log.warn("邮件服务未配置，无法发送验证码到 {}", to);
            return false;
        }
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
        if (!mailConfigured) {
            log.warn("邮件服务未配置，无法发送密码重置验证码到 {}", to);
            return false;
        }
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

    /**
     * 发送联系牧者表单内容到指定邮箱。
     * @return true 表示邮件发送成功；false 表示发送失败（如 SMTP 未配置）。
     */
    public boolean sendPastorContactEmail(String content) {
        if (!mailConfigured) {
            log.warn("邮件服务未配置，无法发送联系牧者表单");
            return false;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo("852341467@qq.com");
        message.setSubject("圣经灵修 - 有人提交联系牧者信息");
        message.setText(content);
        try {
            mailSender.send(message);
            log.info("联系牧者表单已发送至 pastor mailbox");
            return true;
        } catch (Exception e) {
            log.warn("联系牧者表单邮件发送失败: {}", e.getMessage(), e);
            return false;
        }
    }
}
