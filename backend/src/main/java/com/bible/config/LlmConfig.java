package com.bible.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app.llm")
public class LlmConfig {

    /**
     * 大模型服务商：deepseek（默认）、openai、doubao 等
     */
    private String provider = "deepseek";

    /**
     * API Key，通过环境变量 LLM_API_KEY 注入
     */
    private String apiKey;

    /**
     * API 基础地址
     */
    private String baseUrl = "https://api.deepseek.com";

    /**
     * 模型名称（文本对话）
     */
    private String model = "deepseek-chat";

    /**
     * 视觉模型名称（图片识别），DeepSeek 当前暂无 vision，
     * 默认指向 doubao-vision，可通过环境变量 LLM_VISION_MODEL 覆盖。
     * 若与 model 相同则视为不支持视觉，回退到 Tesseract。
     */
    private String visionModel = "deepseek-chat";

    /**
     * 视觉模型 API Key（若与主 API Key 不同可单独配置，否则复用 apiKey）
     */
    private String visionApiKey;

    /**
     * 视觉模型 API 地址（若与主地址不同可单独配置，否则复用 baseUrl）
     */
    private String visionBaseUrl;

    /**
     * 请求超时（秒）
     */
    private int timeoutSeconds = 60;

    /**
     * 是否启用大模型；未配置 API Key 时自动降级为模板解经
     */
    public boolean isEnabled() {
        return apiKey != null && !apiKey.isBlank();
    }
}
