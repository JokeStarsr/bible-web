package com.bible.module.qt.service;

import com.bible.common.exception.BusinessException;
import com.bible.common.pojo.PageResult;
import com.bible.module.qt.dto.*;
import com.bible.module.qt.entity.QtDailyContent;
import com.bible.module.qt.entity.QtUserResponse;
import com.bible.module.qt.mapper.QtDailyContentMapper;
import com.bible.module.qt.mapper.QtUserResponseMapper;
import com.bible.module.user.entity.User;
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
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QtService {

    private final QtDailyContentMapper contentMapper;
    private final QtUserResponseMapper responseMapper;
    private final UserMapper userMapper;

    @Value("${app.qt.upload-dir:/opt/bible-web/uploads/qt-photos}")
    private String uploadDir;

    public QtDailyContentResponse getToday() {
        return getByDate(LocalDate.now());
    }

    public QtDailyContentResponse getByDate(LocalDate date) {
        QtDailyContent content = contentMapper.findByDate(date);
        if (content == null) {
            throw new BusinessException("QT_NOT_FOUND", "该日期暂无灵修内容");
        }
        return toContentResponse(content);
    }

    public QtDailyContentResponse getById(UUID id) {
        QtDailyContent content = contentMapper.findById(id);
        if (content == null) {
            throw new BusinessException("QT_NOT_FOUND", "灵修内容不存在");
        }
        return toContentResponse(content);
    }

    @Transactional
    public void importContents(QtImportRequest request) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (QtImportRequest.QtImportItem item : request.getItems()) {
            LocalDate date = LocalDate.parse(item.getDate(), fmt);
            QtDailyContent existing = contentMapper.findByDate(date);
            if (existing != null) {
                existing.setTitle(item.getTitle());
                existing.setScriptureReference(item.getScriptureReference());
                existing.setScriptureText(item.getScriptureText());
                existing.setCommentary(item.getCommentary());
                existing.setHymn(item.getHymn());
                contentMapper.update(existing);
            } else {
                QtDailyContent c = new QtDailyContent();
                c.setId(UUID.randomUUID());
                c.setQtDate(date);
                c.setTitle(item.getTitle());
                c.setScriptureReference(item.getScriptureReference());
                c.setScriptureText(item.getScriptureText());
                c.setCommentary(item.getCommentary());
                c.setHymn(item.getHymn());
                contentMapper.insert(c);
            }
        }
    }

    public PageResult<QtDailyContentResponse> listContents(int page, int size) {
        int offset = (page - 1) * size;
        int total = contentMapper.countAll();
        List<QtDailyContent> list = contentMapper.findAll(offset, size);
        List<QtDailyContentResponse> items = list.stream()
                .map(this::toContentResponse)
                .collect(Collectors.toList());
        return new PageResult<>(items, total, page, (int) Math.ceil((double) total / size));
    }

    @Transactional
    public void saveResponse(UUID userId, QtUserResponseRequest req) {
        String photosStr = req.getPhotos() != null && !req.getPhotos().isEmpty()
                ? String.join(",", req.getPhotos()) : null;
        QtUserResponse existing = responseMapper.findByUserAndContent(userId, req.getQtContentId());
        if (existing != null) {
            existing.setMeditation(req.getMeditation());
            existing.setApplication(req.getApplication());
            existing.setPrayer(req.getPrayer());
            existing.setPhotos(photosStr);
            responseMapper.update(existing);
        } else {
            QtUserResponse r = new QtUserResponse();
            r.setId(UUID.randomUUID());
            r.setUserId(userId);
            r.setQtContentId(req.getQtContentId());
            r.setMeditation(req.getMeditation());
            r.setApplication(req.getApplication());
            r.setPrayer(req.getPrayer());
            r.setPhotos(photosStr);
            responseMapper.insert(r);
        }
    }

    public String uploadPhoto(UUID userId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new BusinessException("PHOTO_EMPTY", "照片文件为空");
        }
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/"))) {
            throw new BusinessException("PHOTO_TYPE", "仅支持图片文件");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BusinessException("PHOTO_SIZE", "照片大小不能超过10MB");
        }
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            String ext = getExtension(file.getOriginalFilename());
            String filename = userId + "_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 10000) + ext;
            Path filePath = dir.resolve(filename);
            file.transferTo(filePath.toFile());
            log.info("Photo uploaded: {}", filePath);
            return "/uploads/qt-photos/" + filename;
        } catch (IOException e) {
            log.error("Failed to save photo", e);
            throw new BusinessException("PHOTO_SAVE_FAILED", "照片保存失败");
        }
    }

    public QtUserResponseDTO getUserResponse(UUID userId, LocalDate date) {
        QtDailyContent content = contentMapper.findByDate(date);
        if (content == null) {
            throw new BusinessException("QT_NOT_FOUND", "该日期暂无灵修内容");
        }
        QtUserResponse response = responseMapper.findByUserAndContent(userId, content.getId());
        if (response == null) {
            throw new BusinessException("QT_RESPONSE_NOT_FOUND", "您尚未填写该日灵修回应");
        }
        return toResponseDTO(response);
    }

    public List<QtUserResponseDTO> getCommunityResponses(LocalDate date) {
        QtDailyContent content = contentMapper.findByDate(date);
        if (content == null) {
            throw new BusinessException("QT_NOT_FOUND", "该日期暂无灵修内容");
        }
        List<QtUserResponse> responses = responseMapper.findByContentId(content.getId());
        return responses.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public PageResult<QtHistoryResponse> getHistory(UUID userId, int page, int size) {
        int offset = (page - 1) * size;
        int totalContent = contentMapper.countAll();
        List<QtDailyContent> allContents = contentMapper.findAll(0, totalContent);
        int totalResp = responseMapper.countUserHistory(userId);
        List<QtUserResponse> userResponses = responseMapper.findUserHistory(userId, 0, totalResp);

        Map<UUID, QtUserResponse> responseMap = userResponses.stream()
                .collect(Collectors.toMap(QtUserResponse::getQtContentId, r -> r, (a, b) -> a));

        List<QtHistoryResponse> allHistory = new ArrayList<>();
        for (QtDailyContent c : allContents) {
            QtUserResponse resp = responseMap.get(c.getId());
            allHistory.add(QtHistoryResponse.builder()
                    .qtContentId(c.getId())
                    .responseId(resp != null ? resp.getId() : null)
                    .qtDate(c.getQtDate())
                    .title(c.getTitle())
                    .scriptureReference(c.getScriptureReference())
                    .titleKo(c.getTitleKo())
                    .scriptureReferenceKo(c.getScriptureReferenceKo())
                    .responded(resp != null)
                    .meditation(resp != null ? resp.getMeditation() : null)
                    .application(resp != null ? resp.getApplication() : null)
                    .prayer(resp != null ? resp.getPrayer() : null)
                    .build());
        }

        int total = allHistory.size();
        int fromIndex = Math.min(offset, total);
        int toIndex = Math.min(offset + size, total);
        List<QtHistoryResponse> pageItems = allHistory.subList(fromIndex, toIndex);

        return new PageResult<>(pageItems, total, page, (int) Math.ceil((double) total / size));
    }



    @Transactional
    public void deleteResponseByDate(UUID userId, LocalDate date) {
        QtDailyContent content = contentMapper.findByDate(date);
        if (content == null) {
            throw new BusinessException("QT_NOT_FOUND", "该日期暂无灵修内容");
        }
        QtUserResponse response = responseMapper.findByUserAndContent(userId, content.getId());
        if (response == null) {
            throw new BusinessException("RESPONSE_NOT_FOUND", "您尚未填写该日灵修回应");
        }
        responseMapper.deleteById(response.getId());
        log.info("User {} deleted qt response for date {}", userId, date);
    }

    /**
     * 获取所有用户的 QT 回应（用于历史记录按用户名分类展示）
     */
    public List<QtAllResponseDTO> getAllResponses() {
        return responseMapper.findAllResponses();
    }

    @Transactional
    public void deleteResponse(UUID userId, UUID responseId) {
        QtUserResponse response = responseMapper.findById(responseId);
        if (response == null) {
            throw new BusinessException("RESPONSE_NOT_FOUND", "回应不存在");
        }
        if (!response.getUserId().equals(userId)) {
            throw new BusinessException("FORBIDDEN", "只能删除自己的回应");
        }
        responseMapper.deleteById(responseId);
        log.info("User {} deleted qt response {}", userId, responseId);
    }

    private QtDailyContentResponse toContentResponse(QtDailyContent c) {
        return QtDailyContentResponse.builder()
                .id(c.getId())
                .qtDate(c.getQtDate())
                .title(c.getTitle())
                .scriptureReference(c.getScriptureReference())
                .scriptureText(c.getScriptureText())
                .commentary(c.getCommentary())
                .hymn(c.getHymn())
                .titleKo(c.getTitleKo())
                .scriptureReferenceKo(c.getScriptureReferenceKo())
                .scriptureTextKo(c.getScriptureTextKo())
                .commentaryKo(c.getCommentaryKo())
                .hymnKo(c.getHymnKo())
                .build();
    }

    private QtUserResponseDTO toResponseDTO(QtUserResponse r) {
        User user = lookupUser(r.getUserId());
        String username = user != null ? user.getUsername() : "用户";
        String displayName = user != null && user.getDisplayName() != null && !user.getDisplayName().isBlank()
                ? user.getDisplayName() : username;
        List<String> photoList = r.getPhotos() != null && !r.getPhotos().isEmpty()
                ? Arrays.asList(r.getPhotos().split(","))
                : Collections.emptyList();
        return QtUserResponseDTO.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .username(username)
                .displayName(displayName)
                .meditation(r.getMeditation())
                .application(r.getApplication())
                .prayer(r.getPrayer())
                .photos(photoList)
                .createdAt(r.getCreatedAt())
                .build();
    }

    private User lookupUser(UUID userId) {
        try {
            return userMapper.findById(userId);
        } catch (Exception e) {
            return null;
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(dot).toLowerCase() : ".jpg";
    }
}
