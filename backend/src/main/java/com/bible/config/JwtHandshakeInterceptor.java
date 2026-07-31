package com.bible.config;

import com.bible.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;
import java.util.UUID;

/**
 * WebSocket 握手鉴权拦截器。
 * 浏览器 WebSocket 升级请求无法自定义 Authorization 头，故支持从 query 参数 token 或 Authorization 头解析 JWT。
 * 校验通过把 userId 放入 attributes，失败拒绝握手。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {
        String token = null;
        if (request instanceof ServletServerHttpRequest servletRequest) {
            token = servletRequest.getServletRequest().getParameter("token");
            if (token == null || token.isBlank()) {
                String bearer = servletRequest.getServletRequest().getHeader("Authorization");
                if (bearer != null && bearer.startsWith("Bearer ")) {
                    token = bearer.substring(7);
                }
            }
        }
        if (token == null || token.isBlank() || !jwtUtil.validateToken(token)) {
            log.warn("WebSocket 握手鉴权失败");
            return false;
        }
        try {
            UUID userId = jwtUtil.getUserId(token);
            attributes.put("userId", userId);
            return true;
        } catch (Exception e) {
            log.warn("WebSocket 握手解析 userId 失败: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // no-op
    }
}
