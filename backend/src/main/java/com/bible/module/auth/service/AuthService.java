package com.bible.module.auth.service;

import com.bible.common.exception.BusinessException;
import com.bible.config.DevCodeService;
import com.bible.config.MailService;
import com.bible.config.VerificationCodeService;
import com.bible.config.WechatLoginService;
import com.bible.module.auth.dto.*;
import com.bible.module.auth.entity.AuthCredential;
import com.bible.module.auth.mapper.AuthCredentialMapper;
import com.bible.module.auth.mapper.EmailVerificationTokenMapper;
import com.bible.module.auth.mapper.PasswordResetTokenMapper;
import com.bible.module.user.entity.User;
import com.bible.module.user.mapper.UserMapper;
import com.bible.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Slf4j
@Service
public class AuthService {

    private final UserMapper userMapper;
    private final AuthCredentialMapper authCredentialMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    private final MailService mailService;
    private final VerificationCodeService verificationCodeService;
    private final DevCodeService devCodeService;
    private final WechatLoginService wechatLoginService;

    private final Random random = new Random();

    @Autowired
    public AuthService(UserMapper userMapper,
                       AuthCredentialMapper authCredentialMapper,
                       PasswordResetTokenMapper passwordResetTokenMapper,
                       EmailVerificationTokenMapper emailVerificationTokenMapper,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       @Autowired(required = false) MailService mailService,
                       @Autowired(required = false) VerificationCodeService verificationCodeService,
                       @Autowired(required = false) DevCodeService devCodeService,
                       WechatLoginService wechatLoginService) {
        this.userMapper = userMapper;
        this.authCredentialMapper = authCredentialMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.mailService = mailService;
        this.verificationCodeService = verificationCodeService;
        this.devCodeService = devCodeService;
        this.wechatLoginService = wechatLoginService;
    }

    private boolean isDev() {
        return devCodeService != null;
    }

    // ==================== 发送验证码 ====================

    public String sendRegisterCode(String email) {
        if (isDev()) {
            if (!devCodeService.canSendCode(email)) {
                throw new BusinessException("RATE_LIMITED", "发送过于频繁，请稍后再试");
            }
            String code = generateCode();
            devCodeService.saveRegisterCode(email, code);
            devCodeService.markCodeSent(email);
            return code;
        } else {
            if (!verificationCodeService.canSendCode(email)) {
                throw new BusinessException("RATE_LIMITED", "发送过于频繁，请稍后再试");
            }
            String code = generateCode();
            // 尝试发送邮件；若发送失败（如 SMTP 未配置），回退为直接返回验证码，保证注册流程可用
            boolean sent = mailService.sendVerificationCode(email, code);
            verificationCodeService.saveRegisterCode(email, code);
            verificationCodeService.markCodeSent(email);
            return sent ? null : code;
        }
    }

    public String sendResetCode(String email) {
        User user = userMapper.findByEmail(email);
        if (user == null) {
            throw new BusinessException("NOT_FOUND", "该邮箱未注册");
        }
        if (isDev()) {
            if (!devCodeService.canSendCode(email)) {
                throw new BusinessException("RATE_LIMITED", "发送过于频繁，请稍后再试");
            }
            String code = generateCode();
            devCodeService.saveResetCode(email, code);
            devCodeService.markCodeSent(email);
            return code;
        } else {
            if (!verificationCodeService.canSendCode(email)) {
                throw new BusinessException("RATE_LIMITED", "发送过于频繁，请稍后再试");
            }
            String code = generateCode();
            // 尝试发送邮件；若发送失败（如 SMTP 未配置），回退为直接返回验证码，保证找回密码流程可用
            boolean sent = mailService.sendPasswordResetCode(email, code);
            verificationCodeService.saveResetCode(email, code);
            verificationCodeService.markCodeSent(email);
            return sent ? null : code;
        }
    }

    // ==================== 注册 ====================

    @Transactional
    public void register(RegisterRequest req) {
        if (!req.getPassword().equals(req.getConfirmPassword())) {
            throw new BusinessException("VALIDATION_ERROR", "两次密码不一致");
        }
        if (!req.getPassword().matches("^(?=.*[A-Za-z])(?=.*\\d).{8,}$")) {
            throw new BusinessException("PASSWORD_TOO_WEAK", "密码至少包含字母和数字，长度不少于8位");
        }

        boolean codeValid;
        if (isDev()) {
            codeValid = devCodeService.verifyRegisterCode(req.getEmail(), req.getVerificationCode());
        } else {
            codeValid = verificationCodeService.verifyRegisterCode(req.getEmail(), req.getVerificationCode());
        }
        if (!codeValid) {
            throw new BusinessException("INVALID_VERIFICATION_CODE", "验证码错误或已过期");
        }

        if (userMapper.findByUsername(req.getUsername()) != null) {
            throw new BusinessException("USERNAME_ALREADY_EXISTS", "用户名已存在");
        }
        if (userMapper.findByEmail(req.getEmail()) != null) {
            throw new BusinessException("EMAIL_ALREADY_EXISTS", "邮箱已注册");
        }

        UUID userId = UUID.randomUUID();
        User user = new User();
        user.setId(userId);
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setDisplayName(req.getUsername());
        user.setStatus("active");
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userMapper.insert(user);

        AuthCredential cred = new AuthCredential();
        cred.setUserId(userId);
        cred.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        cred.setPasswordUpdatedAt(LocalDateTime.now());
        cred.setFailedLoginCount(0);
        cred.setCreatedAt(LocalDateTime.now());
        cred.setUpdatedAt(LocalDateTime.now());
        authCredentialMapper.insert(cred);

        if (isDev()) {
            devCodeService.deleteRegisterCode(req.getEmail());
        } else {
            verificationCodeService.deleteRegisterCode(req.getEmail());
        }
    }

    // ==================== 登录 ====================

    public LoginResponse login(LoginRequest req) {
        int failCount = isDev() ? devCodeService.getLoginFailCount(req.getEmail())
                : verificationCodeService.getLoginFailCount(req.getEmail());
        if (failCount >= 5) {
            throw new BusinessException("RATE_LIMITED", "登录失败次数过多，请15分钟后再试");
        }

        User user = userMapper.findByEmail(req.getEmail());
        if (user == null || "suspended".equals(user.getStatus()) || "disabled".equals(user.getStatus())) {
            throw new BusinessException("UNAUTHORIZED", "账号或密码错误");
        }

        AuthCredential cred = authCredentialMapper.findByUserId(user.getId());
        if (cred == null) {
            throw new BusinessException("UNAUTHORIZED", "账号或密码错误");
        }

        if (cred.getLockedUntil() != null && cred.getLockedUntil().isAfter(LocalDateTime.now())) {
            throw new BusinessException("UNAUTHORIZED", "账号已被锁定，请稍后再试");
        }

        if (!passwordEncoder.matches(req.getPassword(), cred.getPasswordHash())) {
            if (isDev()) {
                devCodeService.recordLoginFail(req.getEmail());
            } else {
                verificationCodeService.recordLoginFail(req.getEmail());
            }
            throw new BusinessException("UNAUTHORIZED", "账号或密码错误");
        }

        if (isDev()) {
            devCodeService.clearLoginFail(req.getEmail());
        } else {
            verificationCodeService.clearLoginFail(req.getEmail());
        }
        userMapper.updateLastLogin(user.getId());

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getUsername());
        long expiresIn = req.isRememberMe() ? 604800 : 7200;

        LoginResponse.UserInfo info = new LoginResponse.UserInfo(
                user.getId(), user.getUsername(), user.getDisplayName());
        return new LoginResponse(accessToken, refreshToken, expiresIn, info);
    }

    // ==================== 微信登录 ====================

    @Transactional
    public LoginResponse wxLogin(WechatLoginRequest req) {
        String openid = wechatLoginService.getOpenidByCode(req.getCode());
        if (openid == null) {
            throw new BusinessException("WECHAT_LOGIN_FAILED", "微信登录失败，请重试");
        }

        User user = userMapper.findByOpenid(openid);
        if (user == null) {
            // 首次登录，自动注册
            user = new User();
            user.setId(UUID.randomUUID());
            user.setOpenid(openid);
            user.setUsername("wx_" + openid.substring(Math.max(0, openid.length() - 8)));
            user.setDisplayName(req.getNickName() != null ? req.getNickName() : "微信用户");
            user.setAvatarUrl(req.getAvatarUrl());
            user.setStatus("active");
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            userMapper.insert(user);
        } else if ("suspended".equals(user.getStatus()) || "disabled".equals(user.getStatus())) {
            throw new BusinessException("UNAUTHORIZED", "账号已被禁用");
        }

        userMapper.updateLastLogin(user.getId());

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), user.getUsername());

        LoginResponse.UserInfo info = new LoginResponse.UserInfo(
                user.getId(), user.getUsername(), user.getDisplayName());
        return new LoginResponse(accessToken, refreshToken, 7200, info);
    }

    // ==================== 刷新令牌 ====================

    public LoginResponse refreshToken(String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken)) {
            throw new BusinessException("UNAUTHORIZED", "令牌已过期，请重新登录");
        }
        UUID userId = jwtUtil.getUserId(refreshToken);
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new BusinessException("UNAUTHORIZED", "用户不存在");
        }

        String newAccessToken = jwtUtil.generateAccessToken(userId, user.getUsername());
        String newRefreshToken = jwtUtil.generateRefreshToken(userId, user.getUsername());

        LoginResponse.UserInfo info = new LoginResponse.UserInfo(
                user.getId(), user.getUsername(), user.getDisplayName());
        return new LoginResponse(newAccessToken, newRefreshToken, 7200, info);
    }

    // ==================== 找回密码 ====================

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new BusinessException("VALIDATION_ERROR", "两次密码不一致");
        }
        if (!req.getNewPassword().matches("^(?=.*[A-Za-z])(?=.*\\d).{8,}$")) {
            throw new BusinessException("PASSWORD_TOO_WEAK", "密码至少包含字母和数字，长度不少于8位");
        }

        boolean codeValid;
        if (isDev()) {
            codeValid = devCodeService.verifyResetCode(req.getEmail(), req.getVerificationCode());
        } else {
            codeValid = verificationCodeService.verifyResetCode(req.getEmail(), req.getVerificationCode());
        }
        if (!codeValid) {
            throw new BusinessException("INVALID_VERIFICATION_CODE", "验证码错误或已过期");
        }

        User user = userMapper.findByEmail(req.getEmail());
        if (user == null) {
            throw new BusinessException("NOT_FOUND", "用户不存在");
        }

        authCredentialMapper.updatePassword(user.getId(),
                passwordEncoder.encode(req.getNewPassword()), LocalDateTime.now());

        if (isDev()) {
            devCodeService.deleteResetCode(req.getEmail());
        } else {
            verificationCodeService.deleteResetCode(req.getEmail());
        }
    }

    // ==================== 修改密码 ====================

    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest req) {
        if (!req.getNewPassword().equals(req.getConfirmPassword())) {
            throw new BusinessException("VALIDATION_ERROR", "两次密码不一致");
        }
        if (!req.getNewPassword().matches("^(?=.*[A-Za-z])(?=.*\\d).{8,}$")) {
            throw new BusinessException("PASSWORD_TOO_WEAK", "密码至少包含字母和数字，长度不少于8位");
        }

        AuthCredential cred = authCredentialMapper.findByUserId(userId);
        if (cred == null || !passwordEncoder.matches(req.getOldPassword(), cred.getPasswordHash())) {
            throw new BusinessException("VALIDATION_ERROR", "旧密码错误");
        }

        authCredentialMapper.updatePassword(userId,
                passwordEncoder.encode(req.getNewPassword()), LocalDateTime.now());
    }

    private String generateCode() {
        return String.format("%06d", random.nextInt(1000000));
    }
}