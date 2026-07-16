package com.bible.module.praise.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.module.praise.entity.PraiseTrack;
import com.bible.module.praise.service.PraiseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/praise")
@RequiredArgsConstructor
public class PraiseController {

    private final PraiseService praiseService;

    @GetMapping("/random")
    public ApiResponse<PraiseTrack> random() {
        return ApiResponse.ok(praiseService.getRandomTrack());
    }
}