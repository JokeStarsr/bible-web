package com.bible.module.courtship.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.common.pojo.PageResult;
import com.bible.module.courtship.dto.*;
import com.bible.module.courtship.service.CourtshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * 主内佳偶接口：交友资料、心动、匹配、见证、举报。
 */
@RestController
@RequestMapping("/api/v1/courtship")
@RequiredArgsConstructor
public class CourtshipController {

    private final CourtshipService courtshipService;

    // ==================== 资料 ====================

    /** 获取我的资料 */
    @GetMapping("/profile")
    public ApiResponse<ProfileResponse> myProfile(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(courtshipService.getMyProfile(userId));
    }

    /** 创建/更新我的资料 */
    @PutMapping("/profile")
    public ApiResponse<ProfileResponse> upsertProfile(@RequestBody ProfileRequest req, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok("资料已保存", courtshipService.upsertProfile(userId, req));
    }

    /** 浏览资料列表 */
    @GetMapping("/profiles")
    public ApiResponse<PageResult<ProfileResponse>> listProfiles(@RequestParam(required = false) String gender,
                                                                 @RequestParam(required = false) String region,
                                                                 @RequestParam(defaultValue = "1") int page,
                                                                 @RequestParam(defaultValue = "20") int size,
                                                                 Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(courtshipService.listProfiles(userId, gender, region, page, size));
    }

    /** 查看指定用户资料 */
    @GetMapping("/profiles/{userId}")
    public ApiResponse<ProfileResponse> profileDetail(@PathVariable UUID userId, Authentication auth) {
        UUID currentUserId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(courtshipService.getProfileDetail(currentUserId, userId));
    }

    // ==================== 心动 / 匹配 ====================

    /** 表达心动（匹配成功 data 为 MatchResponse，否则 data 为 null） */
    @PostMapping("/likes")
    public ApiResponse<MatchResponse> like(@RequestBody LikeRequest req, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        MatchResponse result = courtshipService.likeUser(userId, req);
        String message = result != null ? "匹配成功，可以开始聊天了" : "心动已表达，等待对方回应";
        return ApiResponse.ok(message, result);
    }

    /** 我的心动列表 */
    @GetMapping("/likes")
    public ApiResponse<List<LikeResponse>> myLikes(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(courtshipService.listMyLikes(userId));
    }

    /** 我的匹配列表 */
    @GetMapping("/matches")
    public ApiResponse<List<MatchResponse>> myMatches(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(courtshipService.listMyMatches(userId));
    }

    /** 解除匹配 */
    @DeleteMapping("/matches/{matchId}")
    public ApiResponse<Void> dissolveMatch(@PathVariable UUID matchId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        courtshipService.dissolveMatch(userId, matchId);
        return ApiResponse.ok("已解除匹配", null);
    }

    // ==================== 见证 ====================

    /** 提交见证 */
    @PostMapping("/witnesses")
    public ApiResponse<Void> submitWitness(@RequestBody WitnessRequest req, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        courtshipService.submitWitness(userId, req);
        return ApiResponse.ok("见证已提交，等待审核", null);
    }

    /** 已通过的见证列表 */
    @GetMapping("/witnesses")
    public ApiResponse<PageResult<WitnessResponse>> listWitnesses(@RequestParam(defaultValue = "1") int page,
                                                                  @RequestParam(defaultValue = "10") int size,
                                                                  Authentication auth) {
        return ApiResponse.ok(courtshipService.listApprovedWitnesses(page, size));
    }

    /** 我的见证 */
    @GetMapping("/witnesses/mine")
    public ApiResponse<List<WitnessResponse>> myWitnesses(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(courtshipService.listMyWitnesses(userId));
    }

    // ==================== 举报 ====================

    /** 举报用户 */
    @PostMapping("/reports")
    public ApiResponse<Void> report(@RequestBody ReportRequest req, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        courtshipService.reportUser(userId, req);
        return ApiResponse.ok("举报已提交", null);
    }

    // ==================== 文件上传 ====================

    /** 上传照片（multipart/form-data） */
    @PostMapping(value = "/upload-photo", consumes = "multipart/form-data")
    public ApiResponse<String> uploadPhoto(@RequestParam("file") MultipartFile file, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok("上传成功", courtshipService.uploadPhoto(userId, file));
    }
}
