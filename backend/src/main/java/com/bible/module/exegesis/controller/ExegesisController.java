package com.bible.module.exegesis.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.module.exegesis.dto.ExegesisRequest;
import com.bible.module.exegesis.dto.ExegesisResponse;
import com.bible.module.exegesis.service.ExegesisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/exegesis")
@RequiredArgsConstructor
public class ExegesisController {

    private final ExegesisService exegesisService;

    @PostMapping("/generate")
    public ApiResponse<ExegesisResponse> generate(@Valid @RequestBody ExegesisRequest req) {
        return ApiResponse.ok("获取成功", exegesisService.getExegesis(req));
    }
}