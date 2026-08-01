package com.bible.module.user.service;

import com.bible.common.exception.BusinessException;
import com.bible.module.user.dto.UpdateProfileRequest;
import com.bible.module.user.dto.UserProfileResponse;
import com.bible.module.user.entity.User;
import com.bible.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    public UserProfileResponse getProfile(UUID userId) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new BusinessException("NOT_FOUND", "用户不存在");
        }
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest req) {
        User user = userMapper.findById(userId);
        if (user == null) {
            throw new BusinessException("NOT_FOUND", "用户不存在");
        }

        // 用户名修改：校验格式 + 唯一性
        if (req.getUsername() != null && !req.getUsername().equals(user.getUsername())) {
            String username = req.getUsername().trim();
            if (username.length() < 3 || username.length() > 32) {
                throw new BusinessException("VALIDATION_ERROR", "用户名长度3-32个字符");
            }
            if (!username.matches("^[A-Za-z0-9_]+$")) {
                throw new BusinessException("VALIDATION_ERROR", "用户名只能包含字母、数字和下划线");
            }
            User existing = userMapper.findByUsername(username);
            if (existing != null && !existing.getId().equals(userId)) {
                throw new BusinessException("USERNAME_ALREADY_EXISTS", "用户名已存在");
            }
            user.setUsername(username);
        }

        // 邮箱修改：校验格式 + 唯一性
        if (req.getEmail() != null && !req.getEmail().equals(user.getEmail())) {
            String email = req.getEmail().trim();
            if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
                throw new BusinessException("VALIDATION_ERROR", "邮箱格式不正确");
            }
            User existing = userMapper.findByEmail(email);
            if (existing != null && !existing.getId().equals(userId)) {
                throw new BusinessException("EMAIL_ALREADY_EXISTS", "邮箱已注册");
            }
            user.setEmail(email);
        }

        if (req.getDisplayName() != null) {
            user.setDisplayName(req.getDisplayName());
        }
        if (req.getBio() != null) {
            user.setBio(req.getBio());
        }
        if (req.getAvatarUrl() != null) {
            user.setAvatarUrl(req.getAvatarUrl());
        }
        userMapper.update(user);

        return toResponse(userMapper.findById(userId));
    }

    private UserProfileResponse toResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .bio(user.getBio())
                .status(user.getStatus())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
