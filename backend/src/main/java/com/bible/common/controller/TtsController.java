package com.bible.common.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.concurrent.TimeUnit;

/**
 * TTS 语音代理：调用 Microsoft Edge TTS（edge-tts）生成希伯来语/希腊语母语发音
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/tts")
public class TtsController {

    private static final String TTS_SCRIPT = "/usr/local/bin/bible-tts.py";
    private static final int TIMEOUT_SECONDS = 15;

    @GetMapping("/speak")
    public ResponseEntity<byte[]> speak(@RequestParam String text,
                                        @RequestParam(defaultValue = "he") String lang) {
        // 限制文本长度，防止滥用
        if (text.length() > 200) {
            text = text.substring(0, 200);
        }
        // 过滤换行等特殊字符，避免命令注入
        text = text.replace("\n", " ").replace("\r", " ");

        try {
            ProcessBuilder pb = new ProcessBuilder(
                "python3", TTS_SCRIPT, lang, text
            );
            pb.redirectErrorStream(false);
            Process process = pb.start();

            // 读取 stdout（音频数据）
            ByteArrayOutputStream audioBuffer = new ByteArrayOutputStream();
            try (InputStream stdout = process.getInputStream()) {
                byte[] buf = new byte[8192];
                int n;
                while ((n = stdout.read(buf)) != -1) {
                    audioBuffer.write(buf, 0, n);
                }
            }

            // 读取 stderr（错误信息）
            ByteArrayOutputStream errBuffer = new ByteArrayOutputStream();
            try (InputStream stderr = process.getErrorStream()) {
                byte[] buf = new byte[4096];
                int n;
                while ((n = stderr.read(buf)) != -1) {
                    errBuffer.write(buf, 0, n);
                }
            }

            boolean finished = process.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("TTS timeout for text: {}", text);
                return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT).build();
            }

            byte[] audio = audioBuffer.toByteArray();
            if (audio.length == 0) {
                String err = errBuffer.toString();
                log.warn("TTS returned empty audio. stderr: {}", err);
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("audio/mpeg"));
            headers.setCacheControl(CacheControl.maxAge(java.time.Duration.ofDays(30)));
            headers.setContentLength(audio.length);

            return new ResponseEntity<>(audio, headers, HttpStatus.OK);
        } catch (Exception e) {
            log.error("TTS failed for text: {}", text, e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
        }
    }
}