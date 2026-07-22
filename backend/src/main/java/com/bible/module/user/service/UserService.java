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