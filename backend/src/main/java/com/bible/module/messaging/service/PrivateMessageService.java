package com.bible.module.messaging.service;

import com.bible.common.exception.BusinessException;
import com.bible.module.annotation.service.VerseAnnotationService;
import com.bible.module.messaging.dto.*;
import com.bible.module.messaging.entity.PrivateMessage;
import com.bible.module.messaging.entity.PrivateMessageSession;
import com.bible.module.messaging.mapper.PrivateMessageMapper;
import com.bible.module.messaging.mapper.PrivateMessageSessionMapper;
import com.bible.module.user.entity.User;
import com.bible.module.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrivateMessageService {

    private final PrivateMessageSessionMapper sessionMapper;
    private final PrivateMessageMapper messageMapper;
    private final VerseAnnotationService annotationService;
    private final UserMapper userMapper;

    @Value("${app.private-message.unlock-rounds:20}")
    private int requiredCommonAnnotations;

    public CanMessageResponse checkCanMessage(UUID currentUserId, UUID targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            return CanMessageResponse.builder()
                    .canMessage(false)
                    .commonAnnotations(0)
                    .requiredAnnotations(requiredCommonAnnotations)
                    .build();
        }
        int common = annotationService.countCommonAnnotatedVerses(currentUserId, targetUserId);
        return CanMessageResponse.builder()
                .canMessage(common >= requiredCommonAnnotations)
                .commonAnnotations(common)
                .requiredAnnotations(requiredCommonAnnotations)
                .build();
    }

    @Transactional
    public SessionResponse createSession(UUID currentUserId, CreateSessionRequest req) {
        UUID targetUserId = req.getUserId();
        if (currentUserId.equals(targetUserId)) {
            throw new BusinessException("VALIDATION_ERROR", "不能给自己发私信");
        }
        User targetUser = userMapper.findById(targetUserId);
        if (targetUser == null) {
            throw new BusinessException("NOT_FOUND", "用户不存在");
        }
        CanMessageResponse can = checkCanMessage(currentUserId, targetUserId);
        if (!can.isCanMessage()) {
            throw new BusinessException("FORBIDDEN",
                    "你们共同划线有感动的经文不足 " + requiredCommonAnnotations + " 条，暂不能私信");
        }

        PrivateMessageSession session = sessionMapper.findByUsers(currentUserId, targetUserId);
        if (session == null) {
            session = new PrivateMessageSession();
            session.setId(UUID.randomUUID());
            session.setUnlockId(null);
            session.setUserAId(currentUserId.compareTo(targetUserId) < 0 ? currentUserId : targetUserId);
            session.setUserBId(currentUserId.compareTo(targetUserId) < 0 ? targetUserId : currentUserId);
            session.setStatus("active");
            session.setCreatedAt(LocalDateTime.now());
            session.setUpdatedAt(LocalDateTime.now());
            sessionMapper.insert(session);
        }
        return toSessionResponse(session, currentUserId);
    }

    public List<SessionResponse> listSessions(UUID currentUserId, int page, int size) {
        int offset = (page - 1) * size;
        List<PrivateMessageSession> sessions = sessionMapper.findByUserId(currentUserId, offset, size);
        return sessions.stream()
                .map(s -> toSessionResponse(s, currentUserId))
                .collect(Collectors.toList());
    }

    public List<MessageResponse> listMessages(UUID currentUserId, UUID sessionId, int page, int size) {
        PrivateMessageSession session = sessionMapper.findById(sessionId);
        if (session == null || !isMember(session, currentUserId)) {
            throw new BusinessException("FORBIDDEN", "无权查看该会话");
        }
        int offset = (page - 1) * size;
        List<PrivateMessage> messages = messageMapper.findBySessionId(sessionId, offset, size);
        return messages.stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageResponse sendMessage(UUID currentUserId, UUID sessionId, SendMessageRequest req) {
        PrivateMessageSession session = sessionMapper.findById(sessionId);
        if (session == null || !isMember(session, currentUserId)) {
            throw new BusinessException("FORBIDDEN", "无权发送消息");
        }
        PrivateMessage message = new PrivateMessage();
        message.setId(UUID.randomUUID());
        message.setSessionId(sessionId);
        message.setSenderId(currentUserId);
        message.setContent(req.getContent().trim());
        message.setStatus("sent");
        message.setCreatedAt(LocalDateTime.now());
        message.setUpdatedAt(LocalDateTime.now());
        messageMapper.insert(message);
        sessionMapper.updateLastMessage(sessionId);
        return toMessageResponse(message);
    }

    private boolean isMember(PrivateMessageSession session, UUID userId) {
        return session.getUserAId().equals(userId) || session.getUserBId().equals(userId);
    }

    private SessionResponse toSessionResponse(PrivateMessageSession session, UUID currentUserId) {
        UUID otherId = session.getUserAId().equals(currentUserId) ? session.getUserBId() : session.getUserAId();
        User otherUser = userMapper.findById(otherId);
        return SessionResponse.builder()
                .id(session.getId())
                .otherUser(SessionResponse.UserInfo.builder()
                        .id(otherId)
                        .displayName(otherUser != null ? otherUser.getDisplayName() : "未知用户")
                        .avatarUrl(otherUser != null ? otherUser.getAvatarUrl() : null)
                        .build())
                .status(session.getStatus())
                .lastMessageAt(session.getLastMessageAt())
                .createdAt(session.getCreatedAt())
                .build();
    }

    private MessageResponse toMessageResponse(PrivateMessage message) {
        return MessageResponse.builder()
                .id(message.getId())
                .sessionId(message.getSessionId())
                .senderId(message.getSenderId())
                .content(message.getContent())
                .status(message.getStatus())
                .readAt(message.getReadAt())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
