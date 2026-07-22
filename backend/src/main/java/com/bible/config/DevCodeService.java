package com.bible.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 开发环境验证码服务
 * 验证码存储在内存中，并打印到控制台
 */
@Slf4j
@Component
@Profile("dev")
public class DevCodeService {

    private final Map<String, CodeEntry> registerCodes = new ConcurrentHashMap<>();
    private final Map<String, CodeEntry> resetCodes = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> sendIntervals = new ConcurrentHashMap<>();
    private final Map<String, Integer> loginFails = new ConcurrentHashMap<>();

    private static final int EXPIRE_SECONDS = 300;
    private static final int SEND_INTERVAL_SECONDS = 60;

    // ==================== 验证码 ====================

    public void saveRegisterCode(String email, String code) {
        registerCodes.put(email, new CodeEntry(code, LocalDateTime.now()));
        log.info("========== [DEV] 注册验证码 ==========");
        log.info("邮箱: {}", email);
        log.info("验证码: {}", code);
        log.info("======================================");
    }

    public void saveResetCode(String email, String code) {
        resetCodes.put(email, new CodeEntry(code, LocalDateTime.now()));
        log.info("========== [DEV] 密码重置验证码 ==========");
        log.info("邮箱: {}", email);
        log.info("验证码: {}", code);
        log.info("==========================================");
    }

    public boolean verifyRegisterCode(String email, String code) {
        CodeEntry entry = registerCodes.get(email);
        if (entry == null) return false;
        if (ChronoUnit.SECONDS.between(entry.createdAt, LocalDateTime.now()) > EXPIRE_SECONDS) {
            registerCodes.remove(email);
            return false;
        }
        return code.equals(entry.code);
    }

    public boolean verifyResetCode(String email, String code) {
        CodeEntry entry = resetCodes.get(email);
        if (entry == null) return false;
        if (ChronoUnit.SECONDS.between(entry.createdAt, LocalDateTime.now()) > EXPIRE_SECONDS) {
            resetCodes.remove(email);
            return false;
        }
        return code.equals(entry.code);
    }

    public void deleteRegisterCode(String email) {
        registerCodes.remove(email);
    }

    public void deleteResetCode(String email) {
        resetCodes.remove(email);
    }

    // ==================== 发送频率限制 ====================

    public boolean canSendCode(String email) {
        LocalDateTime last = sendIntervals.get(email);
        return last == null || ChronoUnit.SECONDS.between(last, LocalDateTime.now()) >= SEND_INTERVAL_SECONDS;
    }

    public void markCodeSent(String email) {
        sendIntervals.put(email, LocalDateTime.now());
    }

    // ==================== 登录失败限制 ====================

    public void recordLoginFail(String email) {
        loginFails.merge(email, 1, Integer::sum);
    }

    public int getLoginFailCount(String email) {
        return loginFails.getOrDefault(email, 0);
    }

    public void clearLoginFail(String email) {
        loginFails.remove(email);
    }

    private record CodeEntry(String code, LocalDateTime createdAt) {}
}