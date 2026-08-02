package com.bible.module.fellowship.controller;

import com.bible.common.pojo.ApiResponse;
import com.bible.common.pojo.PageResult;
import com.bible.module.fellowship.dto.*;
import com.bible.module.fellowship.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * 主内通讯接口。
 */
@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    // ==================== 好友 ====================

    /** 发送好友请求 */
    @PostMapping("/friends/request")
    public ApiResponse<Void> sendFriendRequest(@RequestBody SendFriendRequest req, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        chatService.sendFriendRequest(userId, req);
        return ApiResponse.ok("好友请求已发送", null);
    }

    /** 待处理好友请求列表 */
    @GetMapping("/friends/requests")
    public ApiResponse<List<FriendRequestResponse>> pendingRequests(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(chatService.listPendingRequests(userId));
    }

    /** 接受好友请求 */
    @PostMapping("/friends/requests/{requestId}/accept")
    public ApiResponse<Void> acceptRequest(@PathVariable UUID requestId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        chatService.acceptFriendRequest(userId, requestId);
        return ApiResponse.ok("已添加好友", null);
    }

    /** 拒绝好友请求 */
    @PostMapping("/friends/requests/{requestId}/reject")
    public ApiResponse<Void> rejectRequest(@PathVariable UUID requestId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        chatService.rejectFriendRequest(userId, requestId);
        return ApiResponse.ok("已拒绝请求", null);
    }

    /** 好友列表 */
    @GetMapping("/friends")
    public ApiResponse<List<FriendResponse>> friends(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(chatService.listFriends(userId));
    }

    /** 删除好友 */
    @DeleteMapping("/friends/{friendId}")
    public ApiResponse<Void> removeFriend(@PathVariable UUID friendId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        chatService.removeFriend(userId, friendId);
        return ApiResponse.ok("已删除好友", null);
    }

    // ==================== 用户搜索 ====================

    /** 搜索用户 */
    @GetMapping("/users/search")
    public ApiResponse<List<ChatUserSearchResponse>> searchUsers(@RequestParam("keyword") String keyword,
                                                                 Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(chatService.searchUsers(userId, keyword));
    }

    // ==================== 房间 / 消息 ====================

    /** 创建群聊 */
    @PostMapping("/rooms")
    public ApiResponse<RoomResponse> createRoom(@RequestBody CreateRoomRequest req, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(chatService.createGroupRoom(userId, req));
    }

    /** 群聊房间列表 */
    @GetMapping("/rooms")
    public ApiResponse<List<RoomResponse>> rooms(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(chatService.listRooms(userId));
    }

    /** 房间消息历史 */
    @GetMapping("/rooms/{roomId}/messages")
    public ApiResponse<PageResult<ChatMessageResponse>> roomMessages(@PathVariable UUID roomId,
                                                                 @RequestParam(defaultValue = "1") int page,
                                                                 @RequestParam(defaultValue = "50") int size,
                                                                 Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(chatService.listRoomMessages(userId, roomId, page, size));
    }

    /** 发送消息 */
    @PostMapping("/rooms/{roomId}/messages")
    public ApiResponse<ChatMessageResponse> sendMessage(@PathVariable UUID roomId,
                                                    @RequestBody SendChatMessageRequest req,
                                                    Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(chatService.sendMessage(userId, roomId, req));
    }

    /** 发送图片消息（multipart/form-data） */
    @PostMapping(value = "/rooms/{roomId}/messages/image", consumes = "multipart/form-data")
    public ApiResponse<ChatMessageResponse> sendImageMessage(@PathVariable UUID roomId,
                                                         @RequestParam("file") MultipartFile file,
                                                         Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(chatService.sendImageMessage(userId, roomId, file));
    }

    /** 发送语音消息（multipart/form-data） */
    @PostMapping(value = "/rooms/{roomId}/messages/audio", consumes = "multipart/form-data")
    public ApiResponse<ChatMessageResponse> sendAudioMessage(@PathVariable UUID roomId,
                                                         @RequestParam("file") MultipartFile file,
                                                         Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(chatService.sendAudioMessage(userId, roomId, file));
    }

    /** 发送文件消息（multipart/form-data，支持 PDF/Word/Excel 等任意文件类型，上限 50MB） */
    @PostMapping(value = "/rooms/{roomId}/messages/file", consumes = "multipart/form-data")
    public ApiResponse<ChatMessageResponse> sendFileMessage(@PathVariable UUID roomId,
                                                         @RequestParam("file") MultipartFile file,
                                                         Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(chatService.sendFileMessage(userId, roomId, file));
    }

    /** 标记房间已读 */
    @PostMapping("/rooms/{roomId}/read")
    public ApiResponse<Void> markRead(@PathVariable UUID roomId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        chatService.markRead(userId, roomId);
        return ApiResponse.ok("已标记已读", null);
    }

    /** 房间成员列表 */
    @GetMapping("/rooms/{roomId}/members")
    public ApiResponse<List<RoomMemberResponse>> roomMembers(@PathVariable UUID roomId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ApiResponse.ok(chatService.getRoomMembers(userId, roomId));
    }

    /** 拉人进群（仅群聊；操作者须为群成员） */
    @PostMapping("/rooms/{roomId}/members")
    public ApiResponse<List<RoomMemberResponse>> addRoomMembers(@PathVariable UUID roomId,
                                                                @RequestBody AddMembersRequest req,
                                                                Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        List<RoomMemberResponse> updated = chatService.addMembers(userId, roomId, req);
        return ApiResponse.ok("已添加成员", updated);
    }

    /** 退出群聊 */
    @PostMapping("/rooms/{roomId}/leave")
    public ApiResponse<Void> leaveRoom(@PathVariable UUID roomId, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        chatService.leaveRoom(userId, roomId);
        return ApiResponse.ok("已退出群聊", null);
    }
}
