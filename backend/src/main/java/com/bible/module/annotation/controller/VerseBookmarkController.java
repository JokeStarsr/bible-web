package com.bible.module.annotation.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.module.annotation.dto.BookmarkRequest;
import com.bible.module.annotation.dto.BookmarkResponse;
import com.bible.module.annotation.service.VerseBookmarkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookmarks")
@RequiredArgsConstructor
public class VerseBookmarkController {

    private final VerseBookmarkService bookmarkService;

    @PostMapping
    public ApiResponse<BookmarkResponse> toggle(
            @Valid @RequestBody BookmarkRequest req,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(bookmarkService.toggle(userId, req));
    }

    @GetMapping
    public ApiResponse<List<BookmarkResponse>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(bookmarkService.listByUser(userId, page, size));
    }

    @GetMapping("/check")
    public ApiResponse<BookmarkResponse> check(
            @RequestParam UUID versionId,
            @RequestParam UUID bookId,
            @RequestParam int chapterNumber,
            @RequestParam int verseNumber,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(bookmarkService.check(userId, versionId, bookId, chapterNumber, verseNumber));
    }
}
