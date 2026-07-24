package com.bible.module.annotation.service;

import com.bible.common.exception.BusinessException;
import com.bible.module.annotation.dto.AnnotationResponse;
import com.bible.module.annotation.dto.CreateAnnotationRequest;
import com.bible.module.annotation.dto.UpdateAnnotationRequest;
import com.bible.module.annotation.entity.VerseAnnotation;
import com.bible.module.annotation.mapper.VerseAnnotationMapper;
import com.bible.module.user.entity.User;
import com.bible.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VerseAnnotationService {

    private final VerseAnnotationMapper annotationMapper;
    private final UserMapper userMapper;

    private static final Set<String> VALID_VISIBILITY = Set.of("private", "public");

    @Transactional
    public AnnotationResponse create(UUID userId, CreateAnnotationRequest req) {
        String visibility = req.getVisibility();
        if (visibility == null || !VALID_VISIBILITY.contains(visibility)) {
            visibility = "private";
        }
        if (req.getStartVerse() > req.getEndVerse()) {
            throw new BusinessException("VALIDATION_ERROR", "起始节不能大于结束节");
        }

        VerseAnnotation annotation = new VerseAnnotation();
        annotation.setId(UUID.randomUUID());
        annotation.setUserId(userId);
        annotation.setVersionId(req.getVersionId());
        annotation.setBookId(req.getBookId());
        annotation.setChapterNumber(req.getChapterNumber());
        annotation.setStartVerse(req.getStartVerse());
        annotation.setEndVerse(req.getEndVerse());
        annotation.setSelectedText(req.getSelectedText());
        annotation.setNoteContent(req.getNoteContent());
        annotation.setVisibility(visibility);
        annotation.setCreatedAt(LocalDateTime.now());
        annotation.setUpdatedAt(LocalDateTime.now());
        annotationMapper.insert(annotation);

        return toResponse(annotation, null);
    }

    @Transactional
    public AnnotationResponse update(UUID id, UUID userId, UpdateAnnotationRequest req) {
        VerseAnnotation annotation = annotationMapper.findById(id);
        if (annotation == null) {
            throw new BusinessException("NOT_FOUND", "标注不存在");
        }
        if (!annotation.getUserId().equals(userId)) {
            throw new BusinessException("FORBIDDEN", "无权修改");
        }
        if (req.getVisibility() != null) {
            if (!VALID_VISIBILITY.contains(req.getVisibility())) {
                throw new BusinessException("VALIDATION_ERROR", "可见性参数错误");
            }
            annotation.setVisibility(req.getVisibility());
        }
        if (req.getNoteContent() != null) {
            annotation.setNoteContent(req.getNoteContent());
        }
        annotation.setUpdatedAt(LocalDateTime.now());
        annotationMapper.update(annotation);
        return toResponse(annotation, null);
    }

    @Transactional
    public void delete(UUID id, UUID userId) {
        VerseAnnotation annotation = annotationMapper.findById(id);
        if (annotation == null) {
            throw new BusinessException("NOT_FOUND", "标注不存在");
        }
        if (!annotation.getUserId().equals(userId)) {
            throw new BusinessException("FORBIDDEN", "无权删除");
        }
        annotationMapper.deleteById(id);
    }

    public List<AnnotationResponse> listByUserAndChapter(UUID userId, UUID versionId,
                                                         UUID bookId, int chapterNumber) {
        return annotationMapper.findByUserAndChapter(userId, versionId, bookId, chapterNumber)
                .stream()
                .map(a -> toResponse(a, null))
                .collect(Collectors.toList());
    }

    public List<AnnotationResponse> listPublicByChapter(UUID versionId, UUID bookId, int chapterNumber) {
        List<VerseAnnotation> annotations = annotationMapper.findPublicByChapter(versionId, bookId, chapterNumber);
        Set<UUID> userIds = annotations.stream()
                .map(VerseAnnotation::getUserId)
                .collect(Collectors.toSet());
        Map<UUID, User> userMap = userIds.isEmpty() ? Map.of()
                : userIds.stream()
                .map(userMapper::findById)
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(User::getId, u -> u));

        return annotations.stream()
                .map(a -> toResponse(a, userMap.get(a.getUserId())))
                .collect(Collectors.toList());
    }

    public int countCommonAnnotatedVerses(UUID userA, UUID userB) {
        List<VerseAnnotation> listA = annotationMapper.findByUserId(userA, 0, Integer.MAX_VALUE);
        List<VerseAnnotation> listB = annotationMapper.findByUserId(userB, 0, Integer.MAX_VALUE);
        if (listA.isEmpty() || listB.isEmpty()) {
            return 0;
        }

        Set<String> versesA = expandVerses(listA);
        Set<String> versesB = expandVerses(listB);
        versesA.retainAll(versesB);
        return versesA.size();
    }

    private Set<String> expandVerses(List<VerseAnnotation> annotations) {
        Set<String> verses = new HashSet<>();
        for (VerseAnnotation a : annotations) {
            for (int v = a.getStartVerse(); v <= a.getEndVerse(); v++) {
                verses.add(a.getBookId() + ":" + a.getChapterNumber() + ":" + v);
            }
        }
        return verses;
    }

    private AnnotationResponse toResponse(VerseAnnotation a, User author) {
        AnnotationResponse.AuthorInfo authorInfo = null;
        if (author != null) {
            authorInfo = AnnotationResponse.AuthorInfo.builder()
                    .id(author.getId())
                    .displayName(author.getDisplayName())
                    .avatarUrl(author.getAvatarUrl())
                    .build();
        }
        return AnnotationResponse.builder()
                .id(a.getId())
                .userId(a.getUserId())
                .versionId(a.getVersionId())
                .bookId(a.getBookId())
                .chapterNumber(a.getChapterNumber())
                .startVerse(a.getStartVerse())
                .endVerse(a.getEndVerse())
                .selectedText(a.getSelectedText())
                .noteContent(a.getNoteContent())
                .visibility(a.getVisibility())
                .author(authorInfo)
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
