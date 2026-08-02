package com.bible.module.user.controller;

import com.bible.common.exception.BusinessException;
import com.bible.common.pojo.ApiResponse;
import com.bible.module.auth.entity.AuthCredential;
import com.bible.module.auth.mapper.AuthCredentialMapper;
import com.bible.module.user.dto.*;
import com.bible.module.user.entity.User;
import com.bible.module.user.mapper.UserMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 用户管理接口（仅管理员 852341467@qq.com 可用）
 *
 * <p>提供用户列表、创建、更新、删除（软删除）、重置密码等管理能力。
 * 权限校验基于邮箱白名单，与 QtController.checkAdmin 一致。
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/users/admin")
@RequiredArgsConstructor
public class UserAdminController {

    private final UserMapper userMapper;
    private final AuthCredentialMapper authCredentialMapper;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "852341467@qq.com";

    /** 校验当前登录用户是否为管理员（852341467@qq.com） */
    private void checkAdmin(Authentication auth) {
        if (auth == null) {
            throw new BusinessException("UNAUTHORIZED", "请先登录");
        }
        UUID userId = (UUID) auth.getPrincipal();
        User user = userMapper.findById(userId);
        if (user == null || !ADMIN_EMAIL.equals(user.getEmail())) {
            throw new BusinessException("FORBIDDEN", "无权限操作");
        }
    }

    // ==================== 列表 ====================

    @GetMapping("/list")
    public ApiResponse<List<AdminUserResponse>> list(Authentication auth) {
        checkAdmin(auth);
        List<User> users = userMapper.findAll();
        List<AdminUserResponse> resp = users.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.ok(resp);
    }

    // ==================== 创建 ====================

    @PostMapping
    public ApiResponse<AdminUserResponse> create(@Valid @RequestBody AdminUserCreateRequest req,
                                                 Authentication auth) {
        checkAdmin(auth);

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
        user.setDisplayName(req.getDisplayName() != null && !req.getDisplayName().isBlank()
                ? req.getDisplayName() : req.getUsername());
        user.setStatus(req.getStatus() != null && !req.getStatus().isBlank() ? req.getStatus() : "active");
        user.setEmailVerifiedAt(LocalDateTime.now());
        userMapper.insert(user);

        AuthCredential cred = new AuthCredential();
        cred.setUserId(userId);
        cred.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        cred.setPasswordUpdatedAt(LocalDateTime.now());
        cred.setFailedLoginCount(0);
        authCredentialMapper.insert(cred);

        log.info("Admin created user: username={}, email={}", req.getUsername(), req.getEmail());
        return ApiResponse.ok("创建成功", toResponse(userMapper.findById(userId)));
    }

    // ==================== 更新 ====================

    @PatchMapping("/{id}")
    public ApiResponse<AdminUserResponse> update(@PathVariable UUID id,
                                                 @Valid @RequestBody AdminUserUpdateRequest req,
                                                 Authentication auth) {
        checkAdmin(auth);
        User user = userMapper.findById(id);
        if (user == null) {
            throw new BusinessException("NOT_FOUND", "用户不存在");
        }

        if (req.getUsername() != null && !req.getUsername().equals(user.getUsername())) {
            User existing = userMapper.findByUsername(req.getUsername());
            if (existing != null && !existing.getId().equals(id)) {
                throw new BusinessException("USERNAME_ALREADY_EXISTS", "用户名已存在");
            }
            user.setUsername(req.getUsername());
        }
        if (req.getEmail() != null && !req.getEmail().equals(user.getEmail())) {
            User existing = userMapper.findByEmail(req.getEmail());
            if (existing != null && !existing.getId().equals(id)) {
                throw new BusinessException("EMAIL_ALREADY_EXISTS", "邮箱已注册");
            }
            user.setEmail(req.getEmail());
        }
        if (req.getDisplayName() != null) {
            user.setDisplayName(req.getDisplayName());
        }
        if (req.getBio() != null) {
            user.setBio(req.getBio());
        }
        if (req.getStatus() != null) {
            String s = req.getStatus();
            if (!"active".equals(s) && !"suspended".equals(s) && !"disabled".equals(s)) {
                throw new BusinessException("VALIDATION_ERROR", "状态值非法");
            }
            user.setStatus(s);
        }
        userMapper.update(user);

        log.info("Admin updated user: id={}", id);
        return ApiResponse.ok("更新成功", toResponse(userMapper.findById(id)));
    }

    // ==================== 删除（软删除） ====================

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id, Authentication auth) {
        checkAdmin(auth);
        User user = userMapper.findById(id);
        if (user == null) {
            throw new BusinessException("NOT_FOUND", "用户不存在");
        }
        if (ADMIN_EMAIL.equals(user.getEmail())) {
            throw new BusinessException("FORBIDDEN", "不能删除管理员账号");
        }
        userMapper.softDelete(id);
        log.info("Admin soft-deleted user: id={}, username={}", id, user.getUsername());
        return ApiResponse.ok("删除成功", null);
    }

    // ==================== 重置密码 ====================

    @PostMapping("/{id}/reset-password")
    public ApiResponse<Void> resetPassword(@PathVariable UUID id,
                                           @Valid @RequestBody AdminResetPasswordRequest req,
                                           Authentication auth) {
        checkAdmin(auth);
        User user = userMapper.findById(id);
        if (user == null) {
            throw new BusinessException("NOT_FOUND", "用户不存在");
        }
        authCredentialMapper.updatePassword(id,
                passwordEncoder.encode(req.getNewPassword()), LocalDateTime.now());
        log.info("Admin reset password for user: id={}, username={}", id, user.getUsername());
        return ApiResponse.ok("密码已重置", null);
    }

    // ==================== 辅助 ====================

    private AdminUserResponse toResponse(User user) {
        AuthCredential cred = authCredentialMapper.findByUserId(user.getId());
        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .status(user.getStatus())
                .hasPassword(cred != null && cred.getPasswordHash() != null)
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
