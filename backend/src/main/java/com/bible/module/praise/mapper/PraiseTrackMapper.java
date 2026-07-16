package com.bible.module.praise.mapper;

import com.bible.module.praise.entity.PraiseTrack;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.UUID;

@Mapper
public interface PraiseTrackMapper {

    PraiseTrack findById(UUID id);

    List<PraiseTrack> findAllActive();

    int countActive();

    int insert(PraiseTrack praiseTrack);

    int update(PraiseTrack praiseTrack);
}