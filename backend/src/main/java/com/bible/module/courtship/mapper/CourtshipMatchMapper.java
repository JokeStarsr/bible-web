package com.bible.module.courtship.mapper;

import com.bible.module.courtship.dto.MatchResponse;
import com.bible.module.courtship.entity.CourtshipMatch;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface CourtshipMatchMapper {

    void insert(CourtshipMatch match);

    CourtshipMatch findById(@Param("id") UUID id);

    /** 更新匹配状态 */
    int updateStatus(@Param("id") UUID id, @Param("status") String status);

    /** 我的匹配（status=ACTIVE，JOIN users/profiles 取对方信息） */
    List<MatchResponse> findMyMatches(@Param("userId") UUID userId);
}
