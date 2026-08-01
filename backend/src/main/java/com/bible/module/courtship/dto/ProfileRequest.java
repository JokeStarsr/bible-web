package com.bible.module.courtship.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 创建/更新交友资料请求
 */
@Data
public class ProfileRequest {

    private String nickname;        // 展示昵称
    private String gender;          // MALE / FEMALE
    private LocalDate birthDate;    // 生日
    private String region;          // 所在地区
    private String occupation;      // 职业
    private String bio;             // 自我介绍
    private Integer beliefYears;    // 信主年限
    private String churchName;      // 聚会教会名称
    private String ministryRole;    // 服侍岗位
    private String seekingGender;   // 期望对方性别 MALE/FEMALE
    private Integer seekingAgeMin;  // 期望年龄下限
    private Integer seekingAgeMax;  // 期望年龄上限
    private String seekingRegion;   // 期望地区
    private List<String> photos;    // 照片 URL 列表（最多 6 张）
}
