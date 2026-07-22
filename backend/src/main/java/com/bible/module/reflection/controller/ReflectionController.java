package com.bible.module.reflection.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.module.reflection.dto.CreateReflectionRequest;
import com.bible.module.reflection.dto.ReflectionResponse;
import com.bible.module.reflection.service.ReflectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reflections")
@RequiredArgsConstructor
public class ReflectionController {

    private final ReflectionService reflectionService;

    @PostMapping
    public ApiResponse<ReflectionResponse> create(
            @Valid @RequestBody CreateReflectionRequest req,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok("创建成功", reflectionService.create(userId, req));
    }

    @GetMapping
    public ApiResponse<List<ReflectionResponse>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(reflectionService.listByUser(userId, page, size));
    }

    @GetMapping("/{id}")
    public ApiResponse<ReflectionResponse> detail(@PathVariable UUID id, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(reflectionService.getById(id, userId));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        reflectionService.delete(id, userId);
        return ApiResponse.ok("删除成功", null);
    }
}
