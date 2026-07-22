package com.bible.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * 微信小程序登录服务
 * dev模式：mock openid（直接用code前缀作为openid）
 * prod模式：调用微信 jscode2session 接口
 */
@Slf4j
@Service
public class WechatLoginService {

    private final String appId;
    private final String appSecret;
    private final boolean devMode;

    public WechatLoginService(
            @Value("${wechat.app-id:}") String appId,
            @Value("${wechat.app-secret:}") String appSecret,
            @Value("${spring.profiles.active:dev}") String profile) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.devMode = "dev".equals(profile);
    }

    /**
     * 通过 wx.login 的 code 换取 openid
     * @return openid，失败返回 null
     */
    public String getOpenidByCode(String code) {
        if (devMode) {
            // dev模式：用code前缀作为mock openid，方便本地调试
            String mockOpenid = "mock_" + (code.length() > 8 ? code.substring(0, 8) : code);
            log.info("[DEV] 微信登录mock，code={}, openid={}", code, mockOpenid);
            return mockOpenid;
        }

        // prod模式：调用微信API
        String url = String.format(
                "https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                appId, appSecret, code);

        try {
            RestTemplate restTemplate = new RestTemplate();
            @SuppressWarnings("unchecked")
            Map<String, Object> resp = restTemplate.getForObject(url, Map.class);

            if (resp == null || resp.containsKey("errcode")) {
                log.error("微信登录失败: {}", resp);
                return null;
            }

            return (String) resp.get("openid");
        } catch (Exception e) {
            log.error("调用微信API异常", e);
            return null;
        }
    }
}
