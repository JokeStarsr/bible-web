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
        List<PraiseTrack> externalLink = praiseTrackMapper.findActiveBySourceType("external_link");

        boolean usePublicDomain = !publicDomain.isEmpty()
                && (externalLink.isEmpty() || random.nextInt(100) < 80);

        if (usePublicDomain) {
            return publicDomain.get(random.nextInt(publicDomain.size()));
        }
        if (!externalLink.isEmpty()) {
            return externalLink.get(random.nextInt(externalLink.size()));
        }
        if (!publicDomain.isEmpty()) {
            return publicDomain.get(random.nextInt(publicDomain.size()));
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