package com.bible.module.qt.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.common.pojo.PageResult;
import com.bible.module.qt.dto.*;
import com.bible.module.qt.service.QtPdfService;
import com.bible.module.qt.service.QtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/qt")
@RequiredArgsConstructor
public class QtController {

    private final QtService qtService;
    private final QtPdfService qtPdfService;

    @GetMapping("/today")
    public ApiResponse<QtDailyContentResponse> today() {
        return ApiResponse.ok(qtService.getToday());
    }

    @GetMapping("/date/{date}")
    public ApiResponse<QtDailyContentResponse> byDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.ok(qtService.getByDate(date));
    }

    @PostMapping("/response")
    public ApiResponse<Void> saveResponse(
            @Valid @RequestBody QtUserResponseRequest req,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        qtService.saveResponse(userId, req);
        return ApiResponse.ok("保存成功", null);
    }

    @PostMapping("/photos")
    public ApiResponse<String> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        String url = qtService.uploadPhoto(userId, file);
        return ApiResponse.ok(url);
    }

    @GetMapping("/response/{date}")
    public ApiResponse<QtUserResponseDTO> getUserResponse(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(qtService.getUserResponse(userId, date));
    }


    @DeleteMapping("/response/{date}")
    public ApiResponse<Void> deleteResponse(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        qtService.deleteResponseByDate(userId, date);
        return ApiResponse.ok("删除成功", null);
    }

    @GetMapping("/responses/{date}")
    public ApiResponse<List<QtUserResponseDTO>> communityResponses(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ApiResponse.ok(qtService.getCommunityResponses(date));
    }

    @GetMapping("/history")
    public ApiResponse<PageResult<QtHistoryResponse>> history(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(qtService.getHistory(userId, page, size));
    }

    @PostMapping("/admin/import")
    public ApiResponse<Void> importContents(@Valid @RequestBody QtImportRequest request) {
        qtService.importContents(request);
        return ApiResponse.ok("导入成功", null);
    }

    @PostMapping("/admin/import-pdf")
    public ApiResponse<String> importPdf(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ApiResponse.fail("PDF文件为空");
        }
        if (!"application/pdf".equals(file.getContentType())) {
            return ApiResponse.fail("仅支持PDF文件");
        }
        try {
            QtImportRequest request = qtPdfService.parsePdf(file);
            if (request.getItems().isEmpty()) {
                return ApiResponse.fail("未能从PDF中解析出QT内容，请检查PDF格式。支持格式：按日期分段，每段包含标题、经文、注释等");
            }
            qtService.importContents(request);
            return ApiResponse.ok("PDF导入成功，共导入" + request.getItems().size() + "条记录", null);
        } catch (Exception e) {
            return ApiResponse.fail("PDF解析失败：" + e.getMessage());
        }
    }

    @GetMapping("/admin/contents")
    public ApiResponse<PageResult<QtDailyContentResponse>> listContents(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(qtService.listContents(page, size));
    }
}
