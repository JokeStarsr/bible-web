package com.bible.module.user.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.module.user.dto.UpdateProfileRequest;
import com.bible.module.user.dto.UserProfileResponse;
import com.bible.module.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getProfile(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(userService.getProfile(userId));
    }

    @PatchMapping("/me")
    public ApiResponse<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest req,
                                                           Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok("更新成功", userService.updateProfile(userId, req));
    }
}