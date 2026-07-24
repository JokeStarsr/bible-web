package com.bible.module.messaging.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.module.messaging.dto.*;
import com.bible.module.messaging.service.PrivateMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class PrivateMessageController {

    private final PrivateMessageService privateMessageService;

    @GetMapping("/sessions")
    public ApiResponse<List<SessionResponse>> listSessions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(privateMessageService.listSessions(userId, page, size));
    }

    @PostMapping("/sessions")
    public ApiResponse<SessionResponse> createSession(
            @Valid @RequestBody CreateSessionRequest req,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok("创建成功", privateMessageService.createSession(userId, req));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public ApiResponse<List<MessageResponse>> listMessages(
            @PathVariable UUID sessionId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(privateMessageService.listMessages(userId, sessionId, page, size));
    }

    @PostMapping("/sessions/{sessionId}/messages")
    public ApiResponse<MessageResponse> sendMessage(
            @PathVariable UUID sessionId,
            @Valid @RequestBody SendMessageRequest req,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok("发送成功", privateMessageService.sendMessage(userId, sessionId, req));
    }

    @GetMapping("/can-message/{targetUserId}")
    public ApiResponse<CanMessageResponse> canMessage(
            @PathVariable UUID targetUserId,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(privateMessageService.checkCanMessage(userId, targetUserId));
    }
}
