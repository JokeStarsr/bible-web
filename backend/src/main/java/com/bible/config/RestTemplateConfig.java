package com.bible.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    /** 连接超时（毫秒） */
    @Value("${app.llm.timeout-seconds:60}")
    private int timeoutSeconds;

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        // 读超时随 app.llm.timeout-seconds 配置，避免长文本解经被提前中断
        factory.setReadTimeout(Math.max(timeoutSeconds, 60) * 1000);
        return new RestTemplate(factory);
    }
}
