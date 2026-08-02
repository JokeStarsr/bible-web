package com.bible.module.qt.controller;

import com.bible.common.exception.BusinessException;
import com.bible.common.pojo.ApiResponse;
import com.bible.common.pojo.PageResult;
import com.bible.module.qt.dto.*;
import com.bible.module.qt.service.QtFormatParser;
import com.bible.module.qt.service.QtOcrService;
import com.bible.module.qt.service.QtPdfService;
import com.bible.module.qt.service.QtService;
import com.bible.module.user.entity.User;
import com.bible.module.user.mapper.UserMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/qt")
@RequiredArgsConstructor
public class QtController {

    private final QtService qtService;
    private final QtPdfService qtPdfService;
    private final QtOcrService qtOcrService;
    private final QtFormatParser qtFormatParser;
    private final UserMapper userMapper;

    private static final String ADMIN_EMAIL = "852341467@qq.com";

    /**
     * 校验当前登录用户是否为管理员（852341467@qq.com）
     */
    private void checkAdmin(Authentication auth) {
        if (auth == null) {
            throw new BusinessException("UNAUTHORIZED", "请先登录");
        }
        UUID userId = (UUID) auth.getPrincipal();
        User user = userMapper.findById(userId);
        if (user == null || !ADMIN_EMAIL.equals(user.getEmail())) {
            throw new BusinessException("FORBIDDEN", "无权限操作");
        }
    }

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

    /**
     * 获取所有用户的 QT 回应（用于历史记录按用户名分类展示）
     * 一次 JOIN 查询返回所有回应，前端按用户名分组
     */
    @GetMapping("/all-responses")
    public ApiResponse<List<QtAllResponseDTO>> allResponses(Authentication auth) {
        if (auth == null) {
            throw new BusinessException("UNAUTHORIZED", "请先登录");
        }
        return ApiResponse.ok(qtService.getAllResponses());
    }

    /**
     * 按 responseId 删除自己的回应（历史记录页使用）
     * 含越权校验：只能删除自己的回应
     */
    @DeleteMapping("/response/by-id/{responseId}")
    public ApiResponse<Void> deleteResponseById(
            @PathVariable UUID responseId,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        qtService.deleteResponse(userId, responseId);
        return ApiResponse.ok("删除成功", null);
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

    // ==================== OCR 图片识别接口 ====================

    /**
     * 上传 QT 灵修图片，自动 OCR 识别并返回解析结果（不保存）
     * 仅管理员（852341467@qq.com）可用
     */
    @PostMapping("/admin/ocr-preview")
    public ApiResponse<QtImportRequest> ocrPreview(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        checkAdmin(auth);
        if (file.isEmpty()) {
            return ApiResponse.fail("图片文件为空");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ApiResponse.fail("仅支持图片文件");
        }
        try {
            QtImportRequest result = qtOcrService.recognizeFromImage(file);
            log.info("OCR preview success: {} items", result.getItems().size());
            return ApiResponse.ok("识别成功", result);
        } catch (Exception e) {
            log.error("OCR preview failed", e);
            return ApiResponse.fail("识别失败：" + e.getMessage());
        }
    }

    /**
     * 上传 QT 灵修图片，自动 OCR 识别并直接更新到数据库
     * 仅管理员（852341467@qq.com）可用
     */
    @PostMapping("/admin/ocr-import")
    public ApiResponse<String> ocrImport(
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        checkAdmin(auth);
        if (file.isEmpty()) {
            return ApiResponse.fail("图片文件为空");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ApiResponse.fail("仅支持图片文件");
        }
        try {
            QtImportRequest result = qtOcrService.recognizeFromImage(file);
            if (result.getItems().isEmpty()) {
                return ApiResponse.fail("未能从图片中识别出 QT 内容");
            }
            qtService.importContents(result);
            StringBuilder sb = new StringBuilder("成功导入 ");
            sb.append(result.getItems().size()).append(" 条记录：");
            for (QtImportRequest.QtImportItem item : result.getItems()) {
                sb.append("\n").append(item.getDate()).append(" - ").append(item.getTitle());
            }
            log.info("OCR import success: {} items", result.getItems().size());
            return ApiResponse.ok(sb.toString(), null);
        } catch (Exception e) {
            log.error("OCR import failed", e);
            return ApiResponse.fail("识别失败：" + e.getMessage());
        }
    }

    // ==================== 文本粘贴解析接口（仅管理员） ====================

    /**
     * 粘贴 QT 灵修文本，自动解析并返回结果（不保存）
     * 仅管理员（852341467@qq.com）可用
     */
    @PostMapping("/admin/text-preview")
    public ApiResponse<QtImportRequest> textPreview(
            @RequestBody TextImportRequest req,
            Authentication auth) {
        checkAdmin(auth);
        if (req.getText() == null || req.getText().isBlank()) {
            return ApiResponse.fail("文本内容为空");
        }
        try {
            QtImportRequest result = qtOcrService.recognizeFromText(req.getText(), req.getTargetDate());
            log.info("Text preview success: {} items", result.getItems().size());
            return ApiResponse.ok("解析成功", result);
        } catch (Exception e) {
            log.error("Text preview failed", e);
            return ApiResponse.fail("解析失败：" + e.getMessage());
        }
    }

    /**
     * 粘贴 QT 灵修文本，自动解析并直接更新到数据库
     * 仅管理员（852341467@qq.com）可用
     */
    @PostMapping("/admin/text-import")
    public ApiResponse<String> textImport(
            @RequestBody TextImportRequest req,
            Authentication auth) {
        checkAdmin(auth);
        if (req.getText() == null || req.getText().isBlank()) {
            return ApiResponse.fail("文本内容为空");
        }
        try {
            QtImportRequest result = qtOcrService.recognizeFromText(req.getText(), req.getTargetDate());
            if (result.getItems().isEmpty()) {
                return ApiResponse.fail("未能从文本中解析出 QT 内容");
            }
            qtService.importContents(result);
            StringBuilder sb = new StringBuilder("成功导入 ");
            sb.append(result.getItems().size()).append(" 条记录：");
            for (QtImportRequest.QtImportItem item : result.getItems()) {
                sb.append("\n").append(item.getDate()).append(" - ").append(item.getTitle());
            }
            log.info("Text import success: {} items", result.getItems().size());
            return ApiResponse.ok(sb.toString(), null);
        } catch (Exception e) {
            log.error("Text import failed", e);
            return ApiResponse.fail("解析失败：" + e.getMessage());
        }
    }

    /**
     * 文本导入请求 DTO
     */
    @lombok.Data
    public static class TextImportRequest {
        private String text;
        private String targetDate; // 用户指定的目标日期（yyyy-MM-dd），可选
    }

    // ==================== 确定性格式化解析接口（仅管理员） ====================
    // 针对《每日灵修手册》标准版式粘贴文本，按固定规则解析，排版与手写 SQL 完全一致

    /**
     * 粘贴灵修文本，按固定格式解析返回预览（不保存）
     * 仅管理员（852341467@qq.com）可用
     */
    @PostMapping("/admin/text-format-preview")
    public ApiResponse<QtImportRequest> textFormatPreview(
            @RequestBody TextImportRequest req,
            Authentication auth) {
        checkAdmin(auth);
        if (req.getText() == null || req.getText().isBlank()) {
            return ApiResponse.fail("文本内容为空");
        }
        try {
            QtImportRequest result = qtFormatParser.parse(req.getText(), req.getTargetDate());
            log.info("Text format preview success: title={}, ref={}",
                    result.getItems().get(0).getTitle(), result.getItems().get(0).getScriptureReference());
            return ApiResponse.ok("解析成功", result);
        } catch (Exception e) {
            log.error("Text format preview failed", e);
            return ApiResponse.fail("解析失败：" + e.getMessage());
        }
    }

    /**
     * 粘贴灵修文本，按固定格式解析并直接保存到数据库
     * 仅管理员（852341467@qq.com）可用
     */
    @PostMapping("/admin/text-format-import")
    public ApiResponse<String> textFormatImport(
            @RequestBody TextImportRequest req,
            Authentication auth) {
        checkAdmin(auth);
        if (req.getText() == null || req.getText().isBlank()) {
            return ApiResponse.fail("文本内容为空");
        }
        if (req.getTargetDate() == null || req.getTargetDate().isBlank()) {
            return ApiResponse.fail("请选择目标日期");
        }
        try {
            QtImportRequest result = qtFormatParser.parse(req.getText(), req.getTargetDate());
            qtService.importContents(result);
            QtImportRequest.QtImportItem item = result.getItems().get(0);
            String msg = "成功导入：" + item.getDate() + " - " + item.getTitle() + "（" + item.getScriptureReference() + "）";
            log.info("Text format import success: {} - {}", item.getDate(), item.getTitle());
            return ApiResponse.ok(msg, null);
        } catch (Exception e) {
            log.error("Text format import failed", e);
            return ApiResponse.fail("解析失败：" + e.getMessage());
        }
    }

    /**
     * 检查当前用户是否为 QT 管理员
     */
    @GetMapping("/admin/check")
    public ApiResponse<Boolean> checkAdminRole(Authentication auth) {
        if (auth == null) {
            return ApiResponse.ok(false);
        }
        try {
            UUID userId = (UUID) auth.getPrincipal();
            User user = userMapper.findById(userId);
            boolean isAdmin = user != null && ADMIN_EMAIL.equals(user.getEmail());
            return ApiResponse.ok(isAdmin);
        } catch (Exception e) {
            return ApiResponse.ok(false);
        }
    }
}
