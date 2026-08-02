package com.bible.module.courtship.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 主内佳偶 - 交友资料表（每个用户一份）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourtshipProfile {

    private UUID id;
    private UUID userId;          // 关联用户
    private String nickname;      // 展示昵称
    private String gender;        // MALE / FEMALE
    private LocalDate birthDate;  // 生日（推算年龄）
    private String region;        // 所在地区
    private String occupation;    // 职业
    private String bio;           // 自我介绍
    private Integer beliefYears;  // 信主年限
    private String churchName;    // 聚会教会名称
    private String ministryRole;  // 服侍岗位
    private String seekingGender; // 期望对方性别 MALE/FEMALE
    private Integer seekingAgeMin;// 期望年龄下限
    private Integer seekingAgeMax;// 期望年龄上限
    private String seekingRegion; // 期望地区
    private String photos;        // 照片 URL 数组，逗号分隔字符串（DB 中为 TEXT[]）
    private String status;        // PENDING / APPROVED / REJECTED / HIDDEN
    private String rejectReason;  // 驳回原因
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
