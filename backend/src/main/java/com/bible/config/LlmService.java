package com.bible.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
                "max_tokens", 4096
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
     * 从模型返回的文本中提取 JSON 对象（支持 markdown 代码块包裹）
     */
    public String extractJson(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        String trimmed = text.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
