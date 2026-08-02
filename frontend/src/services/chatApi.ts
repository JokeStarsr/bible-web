import api from './api';

// ==================== 主内通讯 (Fellowship) 类型定义 ====================

export interface FriendRequestInfo {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromAvatarUrl?: string;
  message?: string;
  status: string;
  createdAt: string;
}

export interface FriendInfo {
  friendId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  roomId: string;
  lastMessageContent?: string;
  lastMessageAt?: string;
  unreadCount: number;
}

export interface SearchUserInfo {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isFriend: boolean;
}

export interface RoomInfo {
  id: string;
  name: string;
  type: string;
  avatarUrl?: string;
  memberCount: number;
  lastMessageContent?: string;
  lastMessageAt?: string;
  lastMessageSenderName?: string;
  unreadCount: number;
}

export interface ChatMessageInfo {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl?: string;
  content: string;
  type: string;
  createdAt: string;
}

export interface PageResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface RoomMemberInfo {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

// ==================== 主内通讯 API 封装 ====================
// 所有方法直接返回 res.data.data（已剥离外层 {success, message, data}）

export const chatApi = {
  // ---------- 好友 ----------
  /** 发送好友请求 */
  sendFriendRequest: (friendIdentifier: string, message: string) =>
    api
      .post('/chat/friends/request', { friendIdentifier, message })
      .then((r) => r.data.data),

  /** 待处理好友请求列表 */
  listFriendRequests: () =>
    api.get('/chat/friends/requests').then((r) => r.data.data as FriendRequestInfo[]),

  /** 接受好友请求 */
  acceptFriendRequest: (requestId: string) =>
    api.post(`/chat/friends/requests/${requestId}/accept`).then((r) => r.data.data),

  /** 拒绝好友请求 */
  rejectFriendRequest: (requestId: string) =>
    api.post(`/chat/friends/requests/${requestId}/reject`).then((r) => r.data.data),

  /** 好友列表 */
  listFriends: () =>
    api.get('/chat/friends').then((r) => r.data.data as FriendInfo[]),

  /** 删除好友 */
  deleteFriend: (friendId: string) =>
    api.delete(`/chat/friends/${friendId}`).then((r) => r.data.data),

  // ---------- 用户搜索 ----------
  /** 搜索用户（用户名或邮箱） */
  searchUsers: (keyword: string) =>
    api
      .get('/chat/users/search', { params: { keyword } })
      .then((r) => r.data.data as SearchUserInfo[]),

  // ---------- 群聊房间 ----------
  /** 创建群聊 */
  createRoom: (name: string, memberIds: string[]) =>
    api.post('/chat/rooms', { name, memberIds }).then((r) => r.data.data as { id: string }),

  /** 群聊列表 */
  listRooms: () =>
    api.get('/chat/rooms').then((r) => r.data.data as RoomInfo[]),

  /** 房间历史消息（分页） */
  listMessages: (roomId: string, page = 1, size = 50) =>
    api
      .get(`/chat/rooms/${roomId}/messages`, { params: { page, size } })
      .then((r) => r.data.data as PageResult<ChatMessageInfo>),

  /** 发送消息 */
  sendMessage: (roomId: string, content: string) =>
    api
      .post(`/chat/rooms/${roomId}/messages`, { content })
      .then((r) => r.data.data as ChatMessageInfo),

  /** 发送图片消息（FormData 上传） */
  sendImageMessage: (roomId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post(`/chat/rooms/${roomId}/messages/image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data as ChatMessageInfo);
  },

  /** 发送语音消息（FormData 上传） */
  sendAudioMessage: (roomId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post(`/chat/rooms/${roomId}/messages/audio`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data as ChatMessageInfo);
  },

  /** 发送文件消息（PDF/Word/Excel/其他任意文件，FormData 上传） */
  sendFileMessage: (roomId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post(`/chat/rooms/${roomId}/messages/file`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data as ChatMessageInfo);
  },

  /** 删除消息（仅发送者可删除自己发的消息） */
  deleteMessage: (messageId: string) =>
    api.delete(`/chat/messages/${messageId}`).then((r) => r.data.data),

  /** 标记房间已读 */
  markRead: (roomId: string) =>
    api.post(`/chat/rooms/${roomId}/read`).then((r) => r.data.data),

  /** 房间成员列表 */
  listRoomMembers: (roomId: string) =>
    api.get(`/chat/rooms/${roomId}/members`).then((r) => r.data.data as RoomMemberInfo[]),

  /** 拉人进群（返回更新后的成员列表） */
  addRoomMembers: (roomId: string, memberIds: string[]) =>
    api
      .post(`/chat/rooms/${roomId}/members`, { memberIds })
      .then((r) => r.data.data as RoomMemberInfo[]),

  /** 退出群聊 */
  leaveRoom: (roomId: string) =>
    api.post(`/chat/rooms/${roomId}/leave`).then((r) => r.data.data),
};

export default chatApi;
