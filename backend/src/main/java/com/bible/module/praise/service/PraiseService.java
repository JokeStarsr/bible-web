package com.bible.module.praise.service;

import com.bible.common.exception.BusinessException;
import com.bible.module.praise.entity.PraiseTrack;
import com.bible.module.praise.mapper.PraiseTrackMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PraiseService {

    private final PraiseTrackMapper praiseTrackMapper;
    private final Random random = new Random();

    public PraiseTrack getRandomTrack() {
        List<PraiseTrack> publicDomain = praiseTrackMapper.findActiveBySourceType("public_domain");
        List<PraiseTrack> external = praiseTrackMapper.findActiveBySourceType("external");
        List<PraiseTrack> externalLink = praiseTrackMapper.findActiveBySourceType("external_link");

        // 合并 public_domain 和 external（faithchinesechurch.org 曲目）为可直接播放池
        List<PraiseTrack> playable = new java.util.ArrayList<>();
        playable.addAll(publicDomain);
        playable.addAll(external);

        boolean usePlayable = !playable.isEmpty()
                && (externalLink.isEmpty() || random.nextInt(100) < 80);

        if (usePlayable) {
            return playable.get(random.nextInt(playable.size()));
        }
        if (!externalLink.isEmpty()) {
            return externalLink.get(random.nextInt(externalLink.size()));
        }
        if (!playable.isEmpty()) {
            return playable.get(random.nextInt(playable.size()));
        }

        List<PraiseTrack> active = praiseTrackMapper.findAllActive();
        if (active.isEmpty()) {
            throw new BusinessException("NOT_FOUND", "暂无可用赞美资源");
        }
        return active.get(random.nextInt(active.size()));
    }

    public PraiseTrack getTrack(UUID trackId) {
        PraiseTrack track = praiseTrackMapper.findById(trackId);
        if (track == null) {
            throw new BusinessException("NOT_FOUND", "赞美资源不存在");
        }
        return track;
    }
}