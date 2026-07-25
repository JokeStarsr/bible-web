package com.bible.common.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * TTS 语音代理：转发 Google Translate TTS 请求
 * 解决浏览器无希伯来语语音库的问题
 */
@RestController
@RequestMapping("/api/v1/tts")
@RequiredArgsConstructor
public class TtsController {

    private final RestTemplate restTemplate;

    @GetMapping("/speak")
    public ResponseEntity<byte[]> speak(@RequestParam String text,
                                        @RequestParam(defaultValue = "he") String lang) {
        // 限制文本长度，防止滥用
        if (text.length() > 200) {
            text = text.substring(0, 200);
        }

        String encoded = URLEncoder.encode(text, StandardCharsets.UTF_8);
        String ttsUrl = String.format(
            "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=%s&q=%s",
            lang, encoded
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<byte[]> resp = restTemplate.exchange(
                ttsUrl, HttpMethod.GET, entity, byte[].class
            );

            HttpHeaders outHeaders = new HttpHeaders();
            outHeaders.setContentType(MediaType.valueOf("audio/mpeg"));
            outHeaders.setCacheControl(CacheControl.maxAge(java.time.Duration.ofDays(7)));

            return new ResponseEntity<>(resp.getBody(), outHeaders, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
}
