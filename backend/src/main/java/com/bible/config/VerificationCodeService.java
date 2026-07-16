package com.bible.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@Profile("!dev")
@RequiredArgsConstructor
public class VerificationCodeService {

    private final StringRedisTemplate redisTemplate;

    @Value("${app.verification-code.expire-seconds:300}")
    private int expireSeconds;

    @Value("${app.verification-code.send-interval-seconds:60}")
    private int sendIntervalSeconds;

    private static final String KEY_PREFIX_REGISTER = "email_verify:";
    private static final String KEY_PREFIX_RESET = "password_reset:";
    private static final String KEY_PREFIX_INTERVAL = "send_interval:";

    public void saveRegisterCode(String email, String code) {
        redisTemplate.opsForValue().set(KEY_PREFIX_REGISTER + email, code, expireSeconds, TimeUnit.SECONDS);
    }

    public void saveResetCode(String email, String code) {
        redisTemplate.opsForValue().set(KEY_PREFIX_RESET + email, code, expireSeconds, TimeUnit.SECONDS);
    }

    public boolean verifyRegisterCode(String email, String code) {
        String saved = redisTemplate.opsForValue().get(KEY_PREFIX_REGISTER + email);
        return code.equals(saved);
    }

    public boolean verifyResetCode(String email, String code) {
        String saved = redisTemplate.opsForValue().get(KEY_PREFIX_RESET + email);
        return code.equals(saved);
    }

    public void deleteRegisterCode(String email) {
        redisTemplate.delete(KEY_PREFIX_REGISTER + email);
    }

    public void deleteResetCode(String email) {
        redisTemplate.delete(KEY_PREFIX_RESET + email);
    }

    public boolean canSendCode(String email) {
        Boolean hasKey = redisTemplate.hasKey(KEY_PREFIX_INTERVAL + email);
        return !Boolean.TRUE.equals(hasKey);
    }

    public void markCodeSent(String email) {
        redisTemplate.opsForValue().set(KEY_PREFIX_INTERVAL + email, "1", sendIntervalSeconds, TimeUnit.SECONDS);
    }

    public void recordLoginFail(String email) {
        String key = "login_fail:" + email;
        String count = redisTemplate.opsForValue().get(key);
        int newCount = (count == null) ? 1 : Integer.parseInt(count) + 1;
        redisTemplate.opsForValue().set(key, String.valueOf(newCount), 15, TimeUnit.MINUTES);
    }

    public int getLoginFailCount(String email) {
        String count = redisTemplate.opsForValue().get("login_fail:" + email);
        return count == null ? 0 : Integer.parseInt(count);
    }

    public void clearLoginFail(String email) {
        redisTemplate.delete("login_fail:" + email);
    }
}