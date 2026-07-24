package com.bible.module.praise.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.module.praise.entity.PraiseTrack;
import com.bible.module.praise.service.PraiseService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/praise")
@RequiredArgsConstructor
public class PraiseController {

    private final PraiseService praiseService;

    @GetMapping("/random")
    public ApiResponse<PraiseTrack> random() {
        return ApiResponse.ok(praiseService.getRandomTrack());
    }

    /**
     * 按歌曲 ID 代理外部赞美诗音频流，解决浏览器跨域/加载不稳定问题。
     */
    @GetMapping("/stream/{trackId}")
    public ResponseEntity<StreamingResponseBody> stream(
            @PathVariable UUID trackId,
            @RequestHeader(value = HttpHeaders.RANGE, required = false) String range,
            HttpServletRequest request) {
        PraiseTrack track;
        try {
            track = praiseService.getTrack(trackId);
        } catch (Exception e) {
            log.warn("流媒体请求：找不到歌曲 {}", trackId);
            return ResponseEntity.notFound().build();
        }

        String audioUrl = track.getAudioUrl();
        if (audioUrl == null || audioUrl.isBlank()) {
            log.warn("该曲目无站内音频，trackId={}", trackId);
            return ResponseEntity.status(404).build();
        }
        if (!isAllowedAudioUrl(audioUrl)) {
            log.warn("拒绝代理非允许域名音频，trackId={}", trackId);
            return ResponseEntity.status(403).build();
        }

        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newBuilder()
                    .followRedirects(java.net.http.HttpClient.Redirect.NORMAL)
                    .build();

            java.net.http.HttpRequest.Builder reqBuilder = java.net.http.HttpRequest.newBuilder()
                    .uri(URI.create(audioUrl))
                    .header(HttpHeaders.USER_AGENT, "Mozilla/5.0 (compatible; BibleWeb/1.0)")
                    .header(HttpHeaders.ACCEPT, "audio/*,*/*")
                    .header(HttpHeaders.REFERER, "https://faithchinesechurch.org/")
                    .GET();

            if (range != null && !range.isBlank()) {
                reqBuilder.header(HttpHeaders.RANGE, range);
            }

            java.net.http.HttpResponse<InputStream> response = client.send(
                    reqBuilder.build(),
                    java.net.http.HttpResponse.BodyHandlers.ofInputStream());

            HttpStatusCode statusCode = HttpStatusCode.valueOf(response.statusCode());
            HttpHeaders outgoingHeaders = new HttpHeaders();
            List<String> forwardHeaders = Arrays.asList(
                    HttpHeaders.CONTENT_TYPE,
                    HttpHeaders.CONTENT_LENGTH,
                    HttpHeaders.CONTENT_RANGE,
                    HttpHeaders.ACCEPT_RANGES,
                    HttpHeaders.ETAG,
                    HttpHeaders.LAST_MODIFIED);
            response.headers().map().forEach((name, values) -> {
                if (forwardHeaders.stream().anyMatch(name::equalsIgnoreCase)) {
                    outgoingHeaders.put(name, values);
                }
            });
            outgoingHeaders.put(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, Collections.singletonList("*"));

            StreamingResponseBody body = (OutputStream out) -> {
                try (InputStream in = response.body()) {
                    in.transferTo(out);
                }
            };

            return new ResponseEntity<>(body, outgoingHeaders, statusCode);
        } catch (Exception e) {
            log.warn("代理音频失败，trackId={}，原因: {}", trackId, e.getMessage());
            return ResponseEntity.status(502).build();
        }
    }

    private boolean isAllowedAudioUrl(String url) {
        try {
            URI uri = URI.create(url);
            String host = uri.getHost();
            if (host == null) return false;
            String lowerHost = host.toLowerCase();
            boolean allowedHost = lowerHost.endsWith("faithchinesechurch.org")
                    || lowerHost.endsWith("smallchurchmusic.com");
            return allowedHost && (url.endsWith(".mp3") || url.endsWith(".m4a"));
        } catch (Exception e) {
            return false;
        }
    }
}
