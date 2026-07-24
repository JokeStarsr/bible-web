package com.bible.module.annotation.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.module.annotation.dto.AnnotationResponse;
import com.bible.module.annotation.dto.CreateAnnotationRequest;
import com.bible.module.annotation.dto.UpdateAnnotationRequest;
import com.bible.module.annotation.service.VerseAnnotationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/annotations")
@RequiredArgsConstructor
public class VerseAnnotationController {

    private final VerseAnnotationService annotationService;

    @PostMapping
    public ApiResponse<AnnotationResponse> create(
            @Valid @RequestBody CreateAnnotationRequest req,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok("保存成功", annotationService.create(userId, req));
    }

    @GetMapping
    public ApiResponse<List<AnnotationResponse>> list(
            @RequestParam UUID versionId,
            @RequestParam UUID bookId,
            @RequestParam int chapterNumber,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(annotationService.listByUserAndChapter(userId, versionId, bookId, chapterNumber));
    }

    @GetMapping("/public")
    public ApiResponse<List<AnnotationResponse>> listPublic(
            @RequestParam UUID versionId,
            @RequestParam UUID bookId,
            @RequestParam int chapterNumber) {
        return ApiResponse.ok(annotationService.listPublicByChapter(versionId, bookId, chapterNumber));
    }

    @PutMapping("/{id}")
    public ApiResponse<AnnotationResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAnnotationRequest req,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok("更新成功", annotationService.update(id, userId, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        annotationService.delete(id, userId);
        return ApiResponse.ok("删除成功", null);
    }
}
