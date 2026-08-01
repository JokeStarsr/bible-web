package com.bible.module.courtship.mapper;

import com.bible.module.courtship.dto.WitnessResponse;
import com.bible.module.courtship.entity.CourtshipWitness;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.UUID;

@Mapper
public interface CourtshipWitnessMapper {

    void insert(CourtshipWitness witness);

    /** 已审核通过的见证（分页，JOIN users/profiles 取昵称） */
    List<WitnessResponse> findApproved(@Param("offset") int offset,
                                       @Param("size") int size);

    int countApproved();

    /** 我提交的见证（含审核状态） */
    List<WitnessResponse> findByUserId(@Param("userId") UUID userId);
}
