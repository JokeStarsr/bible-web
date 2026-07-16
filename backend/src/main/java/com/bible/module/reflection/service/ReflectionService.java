package com.bible.module.reflection.service;

import com.bible.common.exception.BusinessException;
import com.bible.module.reflection.dto.CreateReflectionRequest;
import com.bible.module.reflection.dto.ReflectionResponse;
import com.bible.module.reflection.entity.Reflection;
import com.bible.module.reflection.mapper.ReflectionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReflectionService {

    private final ReflectionMapper reflectionMapper;

    @Transactional
    public ReflectionResponse create(UUID userId, CreateReflectionRequest req) {
        Reflection r = new Reflection();
        r.setId(UUID.randomUUID());
        r.setUserId(userId);
        if (req.getGenerationRecordId() != null && !req.getGenerationRecordId().isBlank()) {
            r.setGenerationRecordId(UUID.fromString(req.getGenerationRecordId()));
        }
        r.setReferenceText(req.getReferenceText());
        r.setTitle(req.getTitle());
        r.setContent(req.getContent());
        r.setVisibility(req.getVisibility() != null ? req.getVisibility() : "private");
        r.setStatus("published");
        r.setPublishedAt(LocalDateTime.now());
        r.setCreatedAt(LocalDateTime.now());
        r.setUpdatedAt(LocalDateTime.now());
        reflectionMapper.insert(r);

        return toResponse(r);
    }

    public List<ReflectionResponse> listByUser(UUID userId, int page, int size) {
        int offset = (page - 1) * size;
        List<Reflection> list = reflectionMapper.findByUserId(userId, offset, size);
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ReflectionResponse getById(UUID id, UUID userId) {
        Reflection r = reflectionMapper.findById(id);
        if (r == null) {
            throw new BusinessException("NOT_FOUND", "感悟不存在");
        }
        if (!r.getUserId().equals(userId)) {
            throw new BusinessException("FORBIDDEN", "无权查看");
        }
        return toResponse(r);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        Reflection r = reflectionMapper.findById(id);
        if (r == null) {
            throw new BusinessException("NOT_FOUND", "感悟不存在");
        }
        if (!r.getUserId().equals(userId)) {
            throw new BusinessException("FORBIDDEN", "无权删除");
        }
        reflectionMapper.deleteById(id);
    }

    private ReflectionResponse toResponse(Reflection r) {
        return ReflectionResponse.builder()
                .id(r.getId())
                .referenceText(r.getReferenceText())
                .title(r.getTitle())
                .content(r.getContent())
                .visibility(r.getVisibility())
                .status(r.getStatus())
                .commentCount(r.getCommentCount())
                .likeCount(r.getLikeCount())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
