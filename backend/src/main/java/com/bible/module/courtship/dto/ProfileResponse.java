package com.bible.module.courtship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 交友资料响应（JOIN users 取 username/avatar_url，附带年龄与 likedByMe）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {

    private UUID id;
    private UUID userId;
    private String nickname;
    private String username;        // 来自 users 表
    private String avatarUrl;       // 来自 users 表
    private String gender;
    private LocalDate birthDate;
    private Integer age;            // 由 birthDate 计算
    private String region;
    private String occupation;
    private String bio;
    private Integer beliefYears;
    private String churchName;
    private String ministryRole;
    private String seekingGender;
    private Integer seekingAgeMin;
    private Integer seekingAgeMax;
    private String seekingRegion;
    private String photos;          // 逗号分隔字符串
    private String status;
    private String rejectReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean likedByMe;      // 当前用户是否已对该资料表达心动
}
