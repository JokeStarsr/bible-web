package com.bible.module.fellowship.service;

import com.bible.common.exception.BusinessException;
import com.bible.common.pojo.PageResult;
import com.bible.config.ChatWebSocketHandler;
import com.bible.module.fellowship.dto.*;
import com.bible.module.fellowship.entity.ChatMessage;
import com.bible.module.fellowship.entity.ChatRoom;
import com.bible.module.fellowship.entity.ChatRoomMember;
import com.bible.module.fellowship.entity.Friendship;
import com.bible.module.fellowship.mapper.ChatMessageMapper;
import com.bible.module.fellowship.mapper.ChatRoomMapper;
import com.bible.module.fellowship.mapper.ChatRoomMemberMapper;
import com.bible.module.fellowship.mapper.FellowshipUserMapper;
import com.bible.module.fellowship.mapper.FriendshipMapper;
import com.bible.module.user.entity.User;
import com.bible.module.user.mapper.UserMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 主内通讯服务：好友、单聊、群聊、消息、实时推送。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final FriendshipMapper friendshipMapper;
    private final ChatRoomMapper chatRoomMapper;
    private final ChatRoomMemberMapper chatRoomMemberMapper;
    private final ChatMessageMapper chatMessageMapper;
    private final FellowshipUserMapper fellowshipUserMapper;
    private final UserMapper userMapper;
    private final ChatWebSocketHandler chatWebSocketHandler;
    private final ObjectMapper objectMapper;

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_ACCEPTED = "ACCEPTED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String TYPE_DIRECT = "DIRECT";
    private static final String TYPE_GROUP = "GROUP";
    private static final String MSG_TYPE_TEXT = "TEXT";

    // ==================== 好友 ====================

    /** 发送好友请求 */
    public void sendFriendRequest(UUID userId, SendFriendRequest req) {
        if (req == null || req.getFriendIdentifier() == null || req.getFriendIdentifier().isBlank()) {
            throw new BusinessException("INVALID_PARAM", "请输入用户名或邮箱");
        }
        String identifier = req.getFriendIdentifier().trim();

        // 按用户名或邮箱查找目标用户
        User target = userMapper.findByUsername(identifier);
        if (target == null) {
            target = userMapper.findByEmail(identifier);
        }
        if (target == null) {
            throw new BusinessException("USER_NOT_FOUND", "用户不存在");
        }
        if (target.getId().equals(userId)) {
            throw new BusinessException("CANNOT_ADD_SELF", "不能添加自己为好友");
        }

        Friendship existing = friendshipMapper.findExisting(userId, target.getId());
        if (existing != null) {
            switch (existing.getStatus()) {
                case STATUS_ACCEPTED -> throw new BusinessException("ALREADY_FRIEND", "你们已经是好友");
                case STATUS_PENDING -> {
                    if (existing.getUserId().equals(userId)) {
                        throw new BusinessException("REQUEST_PENDING", "已发送好友请求，等待对方确认");
                    } else {
                        throw new BusinessException("REQUEST_PENDING", "对方已向你发送好友请求，请先处理");
                    }
                }
                case STATUS_REJECTED -> {
                    // 之前被拒绝，允许重新发起
                    friendshipMapper.updateStatus(existing.getId(), STATUS_PENDING);
                    return;
                }
            }
        }

        Friendship f = new Friendship(UUID.randomUUID(), userId, target.getId(), STATUS_PENDING,
                req.getMessage(), null, null);
        friendshipMapper.insert(f);
    }

    /** 收到的待处理好友请求列表 */
    public List<FriendRequestResponse> listPendingRequests(UUID userId) {
        return friendshipMapper.findPendingByFriendId(userId);
    }

    /** 接受好友请求，同时创建单聊房间 */
    @Transactional
    public void acceptFriendRequest(UUID userId, UUID requestId) {
        Friendship f = friendshipMapper.findById(requestId);
        if (f == null) {
            throw new BusinessException("REQUEST_NOT_FOUND", "好友请求不存在");
        }
        if (!f.getFriendId().equals(userId)) {
            throw new BusinessException("FORBIDDEN", "无权处理该好友请求");
        }
        if (!STATUS_PENDING.equals(f.getStatus())) {
            throw new BusinessException("REQUEST_HANDLED", "该好友请求已处理");
        }
        friendshipMapper.updateStatus(requestId, STATUS_ACCEPTED);
        // 自动创建单聊房间
        getOrCreateDirectRoom(f.getUserId(), f.getFriendId());
    }

    /** 拒绝好友请求 */
    public void rejectFriendRequest(UUID userId, UUID requestId) {
        Friendship f = friendshipMapper.findById(requestId);
        if (f == null) {
            throw new BusinessException("REQUEST_NOT_FOUND", "好友请求不存在");
        }
        if (!f.getFriendId().equals(userId)) {
            throw new BusinessException("FORBIDDEN", "无权处理该好友请求");
        }
        if (!STATUS_PENDING.equals(f.getStatus())) {
            throw new BusinessException("REQUEST_HANDLED", "该好友请求已处理");
        }
        friendshipMapper.updateStatus(requestId, STATUS_REJECTED);
    }

    /** 好友列表（含单聊房间与最近消息摘要、未读数） */
    public List<FriendResponse> listFriends(UUID userId) {
        return friendshipMapper.findFriends(userId);
    }

    /** 删除好友 */
    public void removeFriend(UUID userId, UUID friendId) {
        friendshipMapper.deleteFriendship(userId, friendId);
    }

    /** 搜索用户（排除自己，标记是否已是好友） */
    public List<ChatUserSearchResponse> searchUsers(UUID userId, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return Collections.emptyList();
        }
        List<User> users = fellowshipUserMapper.searchByKeyword(userId, keyword.trim(), 20);
        Set<UUID> friendIds = new HashSet<>(friendshipMapper.findAcceptedFriendIds(userId));
        return users.stream()
                .map(u -> new ChatUserSearchResponse(u.getId(), u.getUsername(), u.getDisplayName(),
                        u.getAvatarUrl(), friendIds.contains(u.getId())))
                .collect(Collectors.toList());
    }

    // ==================== 房间 ====================

    /** 创建群聊房间 */
    @Transactional
    public RoomResponse createGroupRoom(UUID userId, CreateRoomRequest req) {
        if (req == null || req.getName() == null || req.getName().isBlank()) {
            throw new BusinessException("INVALID_PARAM", "群聊名称不能为空");
        }
        if (req.getMemberIds() == null || req.getMemberIds().isEmpty()) {
            throw new BusinessException("INVALID_PARAM", "请至少选择一位成员");
        }

        ChatRoom room = new ChatRoom(UUID.randomUUID(), req.getName().trim(), TYPE_GROUP, null, userId, null, null);
        chatRoomMapper.insert(room);

        // 成员去重，包含创建者
        Set<UUID> memberSet = new LinkedHashSet<>();
        memberSet.add(userId);
        for (UUID mid : req.getMemberIds()) {
            if (mid != null && !mid.equals(userId)) {
                memberSet.add(mid);
            }
        }
        for (UUID mid : memberSet) {
            insertMember(room.getId(), mid);
        }

        return new RoomResponse(room.getId(), room.getName(), TYPE_GROUP, null,
                memberSet.size(), null, null, null, 0);
    }

    /** 用户的群聊房间列表 */
    public List<RoomResponse> listRooms(UUID userId) {
        return chatRoomMapper.findGroupRoomsByUserId(userId);
    }

    /** 房间消息历史（分页，按时间正序返回） */
    public PageResult<ChatMessageResponse> listRoomMessages(UUID userId, UUID roomId, int page, int size) {
        assertRoomMember(roomId, userId);
        int offset = Math.max(0, (page - 1) * size);
        int total = chatMessageMapper.countByRoomId(roomId);
        List<ChatMessageResponse> desc = chatMessageMapper.findByRoomId(roomId, offset, size);
        // 数据库按 DESC 查询，反转为 ASC 供前端顺序展示
        Collections.reverse(desc);
        return PageResult.of(desc, page, size, total);
    }

    /** 发送消息（REST），保存后通过 WebSocket 推送给房间在线成员 */
    @Transactional
    public ChatMessageResponse sendMessage(UUID userId, UUID roomId, SendChatMessageRequest req) {
        assertRoomMember(roomId, userId);
        if (req == null || req.getContent() == null || req.getContent().isBlank()) {
            throw new BusinessException("INVALID_PARAM", "消息内容不能为空");
        }

        ChatMessage msg = new ChatMessage(UUID.randomUUID(), roomId, userId, req.getContent().trim(),
                MSG_TYPE_TEXT, LocalDateTime.now());
        chatMessageMapper.insert(msg);

        User sender = userMapper.findById(userId);
        String senderName = resolveDisplayName(sender);
        String senderAvatarUrl = sender != null ? sender.getAvatarUrl() : null;
        ChatMessageResponse resp = new ChatMessageResponse(msg.getId(), roomId, userId, senderName,
                senderAvatarUrl, msg.getContent(), msg.getType(), msg.getCreatedAt());

        // 推送给房间所有在线成员（含发送者多端同步）
        pushMessage(roomId, resp);
        return resp;
    }

    /** 标记房间已读 */
    public void markRead(UUID userId, UUID roomId) {
        int rows = chatRoomMemberMapper.updateLastReadAt(roomId, userId);
        if (rows == 0) {
            throw new BusinessException("FORBIDDEN", "您不是该房间成员");
        }
    }

    /** 房间成员列表 */
    public List<RoomMemberResponse> getRoomMembers(UUID userId, UUID roomId) {
        assertRoomMember(roomId, userId);
        return chatRoomMemberMapper.findRoomMembersWithUserInfo(roomId);
    }

    /** 退出群聊（单聊不可退出） */
    @Transactional
    public void leaveRoom(UUID userId, UUID roomId) {
        ChatRoom room = chatRoomMapper.findById(roomId);
        if (room == null) {
            throw new BusinessException("ROOM_NOT_FOUND", "房间不存在");
        }
        if (TYPE_DIRECT.equals(room.getType())) {
            throw new BusinessException("CANNOT_LEAVE_DIRECT", "单聊房间不可退出");
        }
        assertRoomMember(roomId, userId);
        chatRoomMemberMapper.deleteByRoomAndUser(roomId, userId);
    }

    // ==================== 辅助方法 ====================

    /** 查询或创建两人之间的单聊房间 */
    @Transactional
    public ChatRoom getOrCreateDirectRoom(UUID userId1, UUID userId2) {
        ChatRoom room = chatRoomMapper.findDirectRoomByUsers(userId1, userId2);
        if (room != null) {
            return room;
        }
        room = new ChatRoom(UUID.randomUUID(), null, TYPE_DIRECT, null, userId1, null, null);
        chatRoomMapper.insert(room);
        insertMember(room.getId(), userId1);
        insertMember(room.getId(), userId2);
        return room;
    }

    /** 校验当前用户是房间成员 */
    private void assertRoomMember(UUID roomId, UUID userId) {
        ChatRoomMember member = chatRoomMemberMapper.findByRoomAndUser(roomId, userId);
        if (member == null) {
            throw new BusinessException("FORBIDDEN", "您不是该房间成员");
        }
    }

    private void insertMember(UUID roomId, UUID userId) {
        ChatRoomMember m = new ChatRoomMember(UUID.randomUUID(), roomId, userId, null, null);
        chatRoomMemberMapper.insert(m);
    }

    private String resolveDisplayName(User user) {
        if (user == null) return "用户";
        if (user.getDisplayName() != null && !user.getDisplayName().isBlank()) {
            return user.getDisplayName();
        }
        return user.getUsername();
    }

    /** 通过 WebSocket 推送新消息 */
    private void pushMessage(UUID roomId, ChatMessageResponse message) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", "message");
            payload.put("roomId", roomId);
            payload.put("message", message);
            String json = objectMapper.writeValueAsString(payload);
            List<UUID> memberIds = chatRoomMemberMapper.findMemberUserIds(roomId);
            for (UUID memberId : memberIds) {
                chatWebSocketHandler.sendToUser(memberId, json);
            }
        } catch (Exception e) {
            log.warn("WebSocket 推送消息失败: {}", e.getMessage());
        }
    }
}
