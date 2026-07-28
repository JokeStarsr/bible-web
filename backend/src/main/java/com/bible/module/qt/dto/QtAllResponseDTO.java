package com.bible.module.qt.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * 全部用户的 QT 回应（用于历史记录按用户名分类展示）
 * 一次 JOIN 查询返回：回应内容 + 用户名 + 对应 QT 日期/标题
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QtAllResponseDTO {
    private UUID responseId;
    private UUID userId;
    private String username;
    private String displayName;
    private UUID qtContentId;
    private LocalDate qtDate;
    private String title;
    private String scriptureReference;
    private String titleKo;
    private String scriptureReferenceKo;
    private String meditation;
    private String application;
    private String prayer;
    private LocalDateTime createdAt;

    /** 数据库原始 photos 字符串（逗号分隔），不返回给前端 */
    @JsonIgnore
    private String photosRaw;

    /** 返回给前端的照片列表 */
    public List<String> getPhotos() {
        if (photosRaw == null || photosRaw.isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.asList(photosRaw.split(","));
    }
}
