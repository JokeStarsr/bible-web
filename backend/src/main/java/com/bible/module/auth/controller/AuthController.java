package com.bible.module.auth.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.module.auth.dto.*;
import com.bible.module.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-register-code")
    public ApiResponse<String> sendRegisterCode(@Valid @RequestBody SendCodeRequest req) {
        String code = authService.sendRegisterCode(req.getEmail());
        if (code != null) {
            return ApiResponse.ok("邮件服务未配置，验证码已直接显示在页面", code);
        }
        return ApiResponse.ok("验证码已发送", code);
    }

    @PostMapping("/register")
    public ApiResponse<Void> register(@Valid @RequestBody RegisterRequest req) {
        authService.register(req);
        return ApiResponse.ok("注册成功", null);
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        LoginResponse resp = authService.login(req);
        return ApiResponse.ok("登录成功", resp);
    }

    @PostMapping("/wechat-login")
    public ApiResponse<LoginResponse> wechatLogin(@Valid @RequestBody WechatLoginRequest req) {
        LoginResponse resp = authService.wxLogin(req);
        return ApiResponse.ok("微信登录成功", resp);
    }

    @PostMapping("/refresh-token")
    public ApiResponse<LoginResponse> refreshToken(@RequestBody RefreshTokenRequest req) {
        LoginResponse resp = authService.refreshToken(req.getRefreshToken());
        return ApiResponse.ok(resp);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return ApiResponse.ok("已退出登录", null);
    }

    @PostMapping("/send-reset-code")
    public ApiResponse<String> sendResetCode(@Valid @RequestBody SendCodeRequest req) {
        String code = authService.sendResetCode(req.getEmail());
        if (code != null) {
            return ApiResponse.ok("邮件服务未配置，验证码已直接显示在页面", code);
        }
        return ApiResponse.ok("验证码已发送", code);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        authService.resetPassword(req);
        return ApiResponse.ok("密码重置成功", null);
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest req,
                                             Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        authService.changePassword(userId, req);
        return ApiResponse.ok("密码修改成功", null);
    }
}