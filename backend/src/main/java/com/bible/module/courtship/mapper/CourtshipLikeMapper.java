package com.bible.module.courtship.mapper;

import com.bible.module.courtship.dto.LikeResponse;
import com.bible.module.courtship.entity.CourtshipLike;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface CourtshipLikeMapper {

    void insert(CourtshipLike like);

    /** 查询 from→to 是否已存在心动记录 */
    CourtshipLike findExisting(@Param("fromUserId") UUID fromUserId,
                               @Param("toUserId") UUID toUserId);

    /** 更新心动记录 matched 状态 */
    int updateMatched(@Param("id") UUID id, @Param("matched") boolean matched);

    /** 更新两人之间所有心动记录的 matched 状态（双向，用于解除匹配） */
    int updateMatchedByPair(@Param("userA") UUID userA,
                            @Param("userB") UUID userB,
                            @Param("matched") boolean matched);

    /** 我发出过的心动（未匹配，JOIN users/profiles 取对方信息） */
    List<LikeResponse> findMyLikes(@Param("userId") UUID userId);
}
