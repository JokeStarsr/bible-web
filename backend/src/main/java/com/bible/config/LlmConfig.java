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
     * 模型名称
     */
    private String model = "deepseek-chat";

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
