package com.bible.module.dailythought.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.module.dailythought.dto.DailyThoughtRequest;
import com.bible.module.dailythought.dto.DailyThoughtResponse;
import com.bible.module.dailythought.service.DailyThoughtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/daily-thought")
@RequiredArgsConstructor
public class DailyThoughtController {

    private final DailyThoughtService dailyThoughtService;

    @PostMapping("/generate")
    public ApiResponse<DailyThoughtResponse> generate(@Valid @RequestBody DailyThoughtRequest req) {
        return ApiResponse.ok("生成成功", dailyThoughtService.generate(req));
    }
}
