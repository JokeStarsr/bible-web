package com.bible.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class LlmService {

    private final LlmConfig llmConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * 调用大模型进行对话补全
     *
     * @param systemPrompt 系统提示词
     * @param userPrompt   用户提示词
     * @return 模型返回的文本内容
     */
    public String chat(String systemPrompt, String userPrompt) {
        if (!llmConfig.isEnabled()) {
            throw new IllegalStateException("大模型未配置 API Key，无法调用");
        }

        String url = llmConfig.getBaseUrl().replaceAll("/$", "") + "/v1/chat/completions";

        Map<String, Object> requestBody = Map.of(
                "model", llmConfig.getModel(),
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.7,
                "max_tokens", 8192
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(llmConfig.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                JsonNode message = choices.get(0).path("message");
                return message.path("content").asText().trim();
            }
            throw new RuntimeException("大模型返回格式异常：" + response.getBody());
        } catch (Exception e) {
            log.error("调用大模型失败: provider={}, model={}, error={}",
                    llmConfig.getProvider(), llmConfig.getModel(), e.getMessage(), e);
            throw new RuntimeException("调用大模型失败：" + e.getMessage(), e);
        }
    }

    /**
     * 调用视觉大模型：发送图片 + 文字提示，返回模型文本响应。
     * 兼容 OpenAI 风格的 chat/completions 接口（content 为数组含 image_url）。
     *
     * @param systemPrompt 系统提示词
     * @param userPrompt   用户文字提示
     * @param imageBase64  图片的 Base64 字符串（不含 data:image 前缀）
     * @param mimeType     图片 MIME 类型，如 "image/png" / "image/jpeg"
     * @return 模型返回的文本内容
     */
    public String chatWithImage(String systemPrompt, String userPrompt, String imageBase64, String mimeType) {
        if (!llmConfig.isEnabled()) {
            throw new IllegalStateException("大模型未配置 API Key，无法调用");
        }

        // 视觉模型配置：优先用 vision 专用配置，缺省回退到主配置
        String apiKey = llmConfig.getVisionApiKey() != null && !llmConfig.getVisionApiKey().isBlank()
                ? llmConfig.getVisionApiKey() : llmConfig.getApiKey();
        String baseUrl = llmConfig.getVisionBaseUrl() != null && !llmConfig.getVisionBaseUrl().isBlank()
                ? llmConfig.getVisionBaseUrl() : llmConfig.getBaseUrl();
        String model = llmConfig.getVisionModel() != null && !llmConfig.getVisionModel().isBlank()
                ? llmConfig.getVisionModel() : llmConfig.getModel();

        String url = baseUrl.replaceAll("/$", "") + "/v1/chat/completions";

        // OpenAI 风格的多模态 content（value 类型混合，需用 Map<String,Object> 显式构造）
        String dataUrl = "data:" + mimeType + ";base64," + imageBase64;
        Map<String, Object> textPart = new java.util.HashMap<>();
        textPart.put("type", "text");
        textPart.put("text", userPrompt);
        Map<String, Object> imageUrlPart = new java.util.HashMap<>();
        imageUrlPart.put("type", "image_url");
        imageUrlPart.put("image_url", Map.of("url", dataUrl));
        List<Object> userContent = List.of(textPart, imageUrlPart);

        Map<String, Object> systemMsg = new java.util.HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);
        Map<String, Object> userMsg = new java.util.HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userContent);

        Map<String, Object> requestBody = new java.util.HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(systemMsg, userMsg));
        requestBody.put("temperature", 0.3);
        requestBody.put("max_tokens", 4096);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.POST, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                return choices.get(0).path("message").path("content").asText().trim();
            }
            throw new RuntimeException("视觉大模型返回格式异常：" + response.getBody());
        } catch (Exception e) {
            log.error("调用视觉大模型失败: model={}, error={}", model, e.getMessage(), e);
            throw new RuntimeException("调用视觉大模型失败：" + e.getMessage(), e);
        }
    }

    /**
     * 视觉模型是否可用：配置了非空的 visionModel 即视为可用
     */
    public boolean isVisionAvailable() {
        if (!llmConfig.isEnabled()) {
            return false;
        }
        String vm = llmConfig.getVisionModel();
        return vm != null && !vm.isBlank();
    }

    /**
     * 从模型返回的文本中提取 JSON 对象。
     * 兼容：纯 JSON、markdown 代码块、以及 JSON 前后带有解释文字的情况。
     */
    public String extractJson(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        String trimmed = text.trim();

        // 1. 优先去掉整个字符串首尾 markdown 标记
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        trimmed = trimmed.trim();

        // 2. 如果去掉 markdown 后仍是合法 JSON，直接返回
        try {
            objectMapper.readTree(trimmed);
            return trimmed;
        } catch (Exception ignored) {
            // 继续尝试从文本中定位 JSON 对象
        }

        // 3. 在文本中查找第一个 { 并匹配对应的 }
        int start = trimmed.indexOf('{');
        if (start < 0) {
            return trimmed;
        }
        int depth = 0;
        boolean inString = false;
        boolean escape = false;
        for (int i = start; i < trimmed.length(); i++) {
            char c = trimmed.charAt(i);
            if (inString) {
                if (escape) {
                    escape = false;
                } else if (c == '\\') {
                    escape = true;
                } else if (c == '"') {
                    inString = false;
                }
            } else {
                if (c == '"') {
                    inString = true;
                } else if (c == '{') {
                    depth++;
                } else if (c == '}') {
                    depth--;
                    if (depth == 0) {
                        return trimmed.substring(start, i + 1);
                    }
                }
            }
        }
        return trimmed;
    }
}
