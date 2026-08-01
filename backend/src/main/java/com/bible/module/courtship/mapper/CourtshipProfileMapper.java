package com.bible.module.courtship.mapper;

import com.bible.module.courtship.dto.ProfileResponse;
import com.bible.module.courtship.entity.CourtshipProfile;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface CourtshipProfileMapper {

    void insert(CourtshipProfile profile);

    /** 更新资料（按 user_id，不修改 status，避免改资料后被重新审核） */
    void update(CourtshipProfile profile);

    /** 按用户 id 查询自己的资料（任意状态，供 upsert/我的资料使用） */
    CourtshipProfile findByUserId(@Param("userId") UUID userId);

    /** 我的资料响应（JOIN users，附带 likedByMe，任意状态） */
    ProfileResponse findResponseByUserId(@Param("userId") UUID userId,
                                         @Param("currentUserId") UUID currentUserId);

    /** 查看指定用户资料（仅 APPROVED，附带 likedByMe） */
    ProfileResponse findApprovedResponseByUserId(@Param("targetUserId") UUID targetUserId,
                                                 @Param("currentUserId") UUID currentUserId);

    /** 浏览资料列表（status=APPROVED 且排除自己，分页） */
    List<ProfileResponse> findApprovedProfiles(@Param("userId") UUID userId,
                                               @Param("gender") String gender,
                                               @Param("region") String region,
                                               @Param("offset") int offset,
                                               @Param("size") int size);

    /** 浏览资料列表总数 */
    int countApprovedProfiles(@Param("userId") UUID userId,
                              @Param("gender") String gender,
                              @Param("region") String region);
}
