package com.bible.module.dailythought.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.module.dailythought.dto.DailyThoughtHistoryResponse;
import com.bible.module.dailythought.dto.DailyThoughtRequest;
import com.bible.module.dailythought.dto.DailyThoughtResponse;
import com.bible.module.dailythought.dto.SaveDailyThoughtRequest;
import com.bible.module.dailythought.service.DailyThoughtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/daily-thought")
@RequiredArgsConstructor
public class DailyThoughtController {

    private final DailyThoughtService dailyThoughtService;

    @PostMapping("/generate")
    public ApiResponse<DailyThoughtResponse> generate(@Valid @RequestBody DailyThoughtRequest req) {
        return ApiResponse.ok("生成成功", dailyThoughtService.generate(req));
    }

    @PostMapping("/save")
    public ApiResponse<Void> save(@Valid @RequestBody SaveDailyThoughtRequest req, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        dailyThoughtService.save(userId, req);
        return ApiResponse.ok("保存成功", null);
    }

    @GetMapping("/history")
    public ApiResponse<List<DailyThoughtHistoryResponse>> history(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(dailyThoughtService.listByUser(userId, page, size));
    }
}
