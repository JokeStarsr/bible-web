package com.bible.module.scripture.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.module.scripture.dto.GenerateScriptureRequest;
import com.bible.module.scripture.dto.GenerateScriptureResponse;
import com.bible.module.scripture.service.ScriptureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/scriptures")
@RequiredArgsConstructor
public class ScriptureController {

    private final ScriptureService scriptureService;

    @PostMapping("/generate")
    public ApiResponse<GenerateScriptureResponse> generate(@Valid @RequestBody GenerateScriptureRequest req,
                                                            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok("生成成功", scriptureService.generate(userId, req));
    }

    /**
     * 按书卷和章节查询经文（用于收藏经文展开查看）
     */
    @GetMapping("/chapter")
    public ApiResponse<List<GenerateScriptureResponse.VerseItem>> getChapter(
            @RequestParam UUID versionId,
            @RequestParam UUID bookId,
            @RequestParam int chapterNumber) {
        return ApiResponse.ok(scriptureService.findChapterVerses(versionId, bookId, chapterNumber));
    }
}