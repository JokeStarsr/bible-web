package com.bible.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 主内通讯 WebSocket 处理器。
 * 维护在线用户的多端 session；前端发消息走 REST，WS 主要用于服务端推送。
 * 客户端可发送 {"type":"ping"} 心跳，服务端回 {"type":"pong"}。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;

    /** 在线用户的多端 session（一个用户可能多端登录） */
    private final Map<UUID, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        UUID userId = extractUserId(session);
        if (userId == null) {
            try {
                session.close(CloseStatus.POLICY_VIOLATION);
            } catch (IOException ignored) {
            }
            return;
        }
        userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(session);
        log.debug("WebSocket 已连接: userId={}, session={}, 在线端数={}", userId, session.getId(), userSessions.get(userId).size());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            JsonNode node = objectMapper.readTree(message.getPayload());
            String type = node.path("type").asText();
            if ("ping".equals(type)) {
                sendMessage(session, "{\"type\":\"pong\"}");
            }
            // 其他类型（如 read）暂不处理
        } catch (Exception e) {
            log.warn("处理 WebSocket 消息失败: {}", e.getMessage());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        UUID userId = extractUserId(session);
        if (userId == null) {
            return;
        }
        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                userSessions.remove(userId);
            }
        }
        log.debug("WebSocket 已关闭: userId={}, session={}", userId, session.getId());
    }

    /** 给某用户所有在线 session 推送消息 */
    public void sendToUser(UUID userId, String json) {
        Set<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                sendMessage(session, json);
            }
        }
    }

    private void sendMessage(WebSocketSession session, String json) {
        try {
            session.sendMessage(new TextMessage(json));
        } catch (IOException e) {
            log.warn("WebSocket 发送失败: {}", e.getMessage());
        }
    }

    private UUID extractUserId(WebSocketSession session) {
        Object value = session.getAttributes().get("userId");
        return value instanceof UUID ? (UUID) value : null;
    }
}
