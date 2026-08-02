package com.bible.module.courtship.service;

import com.bible.common.exception.BusinessException;
import com.bible.common.pojo.PageResult;
import com.bible.module.courtship.dto.*;
import com.bible.module.courtship.entity.*;
import com.bible.module.courtship.mapper.*;
import com.bible.module.fellowship.entity.ChatRoom;
import com.bible.module.fellowship.service.ChatService;
import com.bible.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.Period;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * 主内佳偶服务：交友资料、心动意向、互相匹配、见证分享、举报。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CourtshipService {

    private final CourtshipProfileMapper profileMapper;
    private final CourtshipLikeMapper likeMapper;
    private final CourtshipMatchMapper matchMapper;
    private final CourtshipWitnessMapper witnessMapper;
    private final CourtshipReportMapper reportMapper;
    private final UserMapper userMapper;
    private final ChatService chatService;

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_DISSOLVED = "DISSOLVED";

    /** 照片最多 6 张 */
    private static final int MAX_PHOTOS = 6;
    /** 图片大小上限：10MB */
    private static final long IMAGE_MAX_SIZE = 10L * 1024 * 1024;

    /** 交友照片保存目录，由 nginx 静态服务 /uploads/ 下 */
    @Value("${app.courtship.upload-dir:/opt/bible-web/uploads/courtship}")
    private String uploadDir;

    // ==================== 资料 ====================

    /** 获取我的资料（无资料返回 null） */
    public ProfileResponse getMyProfile(UUID userId) {
        ProfileResponse resp = profileMapper.findResponseByUserId(userId, userId);
        if (resp == null) {
            return null;
        }
        resp.setAge(calcAge(resp.getBirthDate()));
        return resp;
    }

    /** 创建或更新自己的资料（新创建 status=PENDING；更新不重置已通过审核的状态） */
    public ProfileResponse upsertProfile(UUID userId, ProfileRequest req) {
        if (req == null || req.getNickname() == null || req.getNickname().isBlank()) {
            throw new BusinessException("INVALID_PARAM", "昵称不能为空");
        }
        String gender = req.getGender();
        if (!"MALE".equals(gender) && !"FEMALE".equals(gender)) {
            throw new BusinessException("INVALID_PARAM", "性别必须为 MALE 或 FEMALE");
        }
        List<String> photos = req.getPhotos() == null ? Collections.emptyList()
                : req.getPhotos().stream()
                    .filter(s -> s != null && !s.isBlank())
                    .collect(Collectors.toList());
        if (photos.size() > MAX_PHOTOS) {
            throw new BusinessException("TOO_MANY_PHOTOS", "最多上传 " + MAX_PHOTOS + " 张照片");
        }
        String photosStr = photos.isEmpty() ? null : String.join(",", photos);

        CourtshipProfile existing = profileMapper.findByUserId(userId);
        if (existing == null) {
            CourtshipProfile p = new CourtshipProfile();
            p.setId(UUID.randomUUID());
            p.setUserId(userId);
            applyRequest(p, req, photosStr);
            p.setStatus(STATUS_PENDING);
            profileMapper.insert(p);
        } else {
            CourtshipProfile p = new CourtshipProfile();
            p.setUserId(userId);
            applyRequest(p, req, photosStr);
            // update SQL 不修改 status，保留原状态（已通过审核的不会因改资料被重新审核）
            profileMapper.update(p);
        }
        return getMyProfile(userId);
    }

    /** 浏览资料列表（status=APPROVED 且排除自己，附带 likedByMe，按 updated_at DESC） */
    public PageResult<ProfileResponse> listProfiles(UUID userId, String gender, String region, int page, int size) {
        int offset = Math.max(0, (page - 1) * size);
        List<ProfileResponse> list = profileMapper.findApprovedProfiles(userId, gender, region, offset, size);
        list.forEach(r -> r.setAge(calcAge(r.getBirthDate())));
        int total = profileMapper.countApprovedProfiles(userId, gender, region);
        return PageResult.of(list, page, size, total);
    }

    /** 查看指定用户资料（需 APPROVED 才能看） */
    public ProfileResponse getProfileDetail(UUID userId, UUID targetUserId) {
        ProfileResponse resp = profileMapper.findApprovedResponseByUserId(targetUserId, userId);
        if (resp == null) {
            throw new BusinessException("PROFILE_NOT_FOUND", "资料不存在或未通过审核");
        }
        resp.setAge(calcAge(resp.getBirthDate()));
        return resp;
    }

    // ==================== 心动 / 匹配 ====================

    /**
     * 表达心动：插入 courtship_likes；若对方也对我心动，则互相匹配：
     * 更新两条 like 的 matched=true，创建 courtship_matches，
     * 复用 ChatService 创建/获取单聊房间。匹配成功返回 MatchResponse，否则返回 null。
     */
    @Transactional
    public MatchResponse likeUser(UUID fromUserId, LikeRequest req) {
        if (req == null || req.getToUserId() == null) {
            throw new BusinessException("INVALID_PARAM", "请选择心动的对象");
        }
        UUID toUserId = req.getToUserId();
        if (toUserId.equals(fromUserId)) {
            throw new BusinessException("CANNOT_LIKE_SELF", "不能对自己表达心动");
        }
        if (likeMapper.findExisting(fromUserId, toUserId) != null) {
            throw new BusinessException("ALREADY_LIKED", "已表达过心动");
        }

        CourtshipLike like = new CourtshipLike(UUID.randomUUID(), fromUserId, toUserId,
                req.getMessage(), false, null);
        likeMapper.insert(like);

        // 对方是否也对我心动
        CourtshipLike reverse = likeMapper.findExisting(toUserId, fromUserId);
        if (reverse == null) {
            return null;
        }

        // 互相心动 → 匹配成功
        likeMapper.updateMatched(like.getId(), true);
        likeMapper.updateMatched(reverse.getId(), true);

        // 匹配成功后建立好友关系（ACCEPTED）并确保存在单聊房间
        chatService.ensureFriendshipForMatch(fromUserId, toUserId);
        ChatRoom room = chatService.getOrCreateDirectRoom(fromUserId, toUserId);

        // user_a_id 取较小者，user_b_id 取较大者，与唯一索引一致
        UUID userA = fromUserId.compareTo(toUserId) < 0 ? fromUserId : toUserId;
        UUID userB = fromUserId.compareTo(toUserId) < 0 ? toUserId : fromUserId;
        CourtshipMatch match = new CourtshipMatch(UUID.randomUUID(), userA, userB,
                room.getId(), STATUS_ACTIVE, null);
        matchMapper.insert(match);

        // 复用列表查询（带 JOIN 昵称/头像）构造响应
        return matchMapper.findMyMatches(fromUserId).stream()
                .filter(mr -> mr.getId().equals(match.getId()))
                .findFirst()
                .orElse(null);
    }

    /** 我发出过的心动（未匹配的） */
    public List<LikeResponse> listMyLikes(UUID userId) {
        return likeMapper.findMyLikes(userId);
    }

    /** 我的匹配（status=ACTIVE） */
    public List<MatchResponse> listMyMatches(UUID userId) {
        return matchMapper.findMyMatches(userId);
    }

    /** 解除匹配：match status=DISSOLVED，相关 likes matched=false */
    @Transactional
    public void dissolveMatch(UUID userId, UUID matchId) {
        CourtshipMatch match = matchMapper.findById(matchId);
        if (match == null) {
            throw new BusinessException("MATCH_NOT_FOUND", "匹配不存在");
        }
        if (!match.getUserAId().equals(userId) && !match.getUserBId().equals(userId)) {
            throw new BusinessException("FORBIDDEN", "无权操作该匹配");
        }
        if (!STATUS_ACTIVE.equals(match.getStatus())) {
            throw new BusinessException("MATCH_NOT_ACTIVE", "该匹配已解除");
        }
        matchMapper.updateStatus(matchId, STATUS_DISSOLVED);
        likeMapper.updateMatchedByPair(match.getUserAId(), match.getUserBId(), false);
    }

    // ==================== 见证 ====================

    /** 提交见证（status=PENDING） */
    public void submitWitness(UUID userId, WitnessRequest req) {
        if (req == null || req.getTitle() == null || req.getTitle().isBlank()) {
            throw new BusinessException("INVALID_PARAM", "见证标题不能为空");
        }
        if (req.getContent() == null || req.getContent().isBlank()) {
            throw new BusinessException("INVALID_PARAM", "见证内容不能为空");
        }
        CourtshipWitness w = new CourtshipWitness(UUID.randomUUID(), userId, req.getTitle().trim(),
                req.getContent().trim(), req.getPhotoUrl(), STATUS_PENDING, null, null, null);
        witnessMapper.insert(w);
    }

    /** 已审核通过的见证（分页） */
    public PageResult<WitnessResponse> listApprovedWitnesses(int page, int size) {
        int offset = Math.max(0, (page - 1) * size);
        List<WitnessResponse> list = witnessMapper.findApproved(offset, size);
        int total = witnessMapper.countApproved();
        return PageResult.of(list, page, size, total);
    }

    /** 我提交的见证（含审核状态） */
    public List<WitnessResponse> listMyWitnesses(UUID userId) {
        return witnessMapper.findByUserId(userId);
    }

    // ==================== 举报 ====================

    /** 创建举报记录 */
    public void reportUser(UUID reporterId, ReportRequest req) {
        if (req == null || req.getReportedId() == null) {
            throw new BusinessException("INVALID_PARAM", "请选择被举报用户");
        }
        if (req.getReportedId().equals(reporterId)) {
            throw new BusinessException("CANNOT_REPORT_SELF", "不能举报自己");
        }
        if (req.getReason() == null || req.getReason().isBlank()) {
            throw new BusinessException("INVALID_PARAM", "请填写举报原因");
        }
        CourtshipReport r = new CourtshipReport(UUID.randomUUID(), reporterId, req.getReportedId(),
                req.getReason().trim(), req.getDetail(), STATUS_PENDING, null);
        reportMapper.insert(r);
    }

    // ==================== 文件上传 ====================

    /** 上传照片：校验 + 落盘，返回可访问的相对 URL */
    public String uploadPhoto(UUID userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("FILE_EMPTY", "照片文件为空");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("FILE_TYPE", "仅支持图片文件");
        }
        if (file.getSize() > IMAGE_MAX_SIZE) {
            throw new BusinessException("FILE_SIZE", "图片大小不能超过10MB");
        }
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            String ext = getExtension(file.getOriginalFilename());
            String filename = "photo_" + userId + "_" + System.currentTimeMillis()
                    + "_" + (int) (Math.random() * 10000) + ext;
            Path filePath = dir.resolve(filename);
            file.transferTo(filePath.toFile());
            log.info("Courtship photo uploaded: {}", filePath);
            return "/uploads/courtship/" + filename;
        } catch (IOException e) {
            log.error("Failed to save courtship photo", e);
            throw new BusinessException("FILE_SAVE_FAILED", "文件保存失败");
        }
    }

    // ==================== 辅助方法 ====================

    /** 将请求字段写入实体（不含 id/userId/status/时间戳） */
    private void applyRequest(CourtshipProfile p, ProfileRequest req, String photosStr) {
        p.setNickname(req.getNickname().trim());
        p.setGender(req.getGender());
        p.setBirthDate(req.getBirthDate());
        p.setRegion(req.getRegion());
        p.setOccupation(req.getOccupation());
        p.setBio(req.getBio());
        p.setBeliefYears(req.getBeliefYears());
        p.setChurchName(req.getChurchName());
        p.setMinistryRole(req.getMinistryRole());
        p.setSeekingGender(req.getSeekingGender());
        p.setSeekingAgeMin(req.getSeekingAgeMin());
        p.setSeekingAgeMax(req.getSeekingAgeMax());
        p.setSeekingRegion(req.getSeekingRegion());
        p.setPhotos(photosStr);
    }

    /** 由生日计算年龄 */
    private int calcAge(LocalDate birthDate) {
        if (birthDate == null) {
            return 0;
        }
        return Period.between(birthDate, LocalDate.now()).getYears();
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(dot).toLowerCase() : "";
    }
}
