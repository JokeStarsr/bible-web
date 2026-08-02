'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { chatApi } from '@/services/chatApi';
import type {
  FriendInfo,
  FriendRequestInfo,
  RoomInfo,
  ChatMessageInfo,
} from '@/services/chatApi';
import { useI18n } from '@/i18n/I18nContext';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import AddFriendModal from './components/AddFriendModal';
import FriendRequestsModal from './components/FriendRequestsModal';
import CreateRoomModal from './components/CreateRoomModal';
import MembersModal from './components/MembersModal';
import AddMembersModal from './components/AddMembersModal';

// 历史消息每页条数
const PAGE_SIZE = 50;

export default function FellowshipPage() {
  const router = useRouter();
  const { t } = useI18n();

  // 认证状态
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  // 列表数据
  const [activeTab, setActiveTab] = useState<'friends' | 'rooms'>('friends');
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [requests, setRequests] = useState<FriendRequestInfo[]>([]);

  // 当前选中会话
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // 消息列表
  const [messages, setMessages] = useState<ChatMessageInfo[]>([]);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // 输入与发送
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  // 弹窗
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showRequests, setShowRequests] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  // 邀请成员时需排除的已在群成员 id 集合
  const [inviteExistingIds, setInviteExistingIds] = useState<Set<string>>(new Set());

  // WebSocket
  const { connected, subscribe, subscribeAll } = useChatWebSocket();

  // 用 ref 跟踪 selectedRoomId，避免全局监听器闭包过期
  const selectedRoomIdRef = useRef<string | null>(null);
  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
  }, [selectedRoomId]);

  // ---------- 认证检查 ----------
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      window.location.href = '/login';
      return;
    }
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo.id) setCurrentUserId(userInfo.id);
    } catch {
      /* ignore */
    }
    setCheckingAuth(false);
    // 初次加载所有列表
    loadFriends();
    loadRooms();
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- 数据加载 ----------
  const loadFriends = useCallback(async () => {
    try {
      const data = await chatApi.listFriends();
      setFriends(data || []);
    } catch {
      /* ignore */
    }
  }, []);

  const loadRooms = useCallback(async () => {
    try {
      const data = await chatApi.listRooms();
      setRooms(data || []);
    } catch {
      /* ignore */
    }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const data = await chatApi.listFriendRequests();
      setRequests(data || []);
    } catch {
      /* ignore */
    }
  }, []);

  // ---------- 消息管理 ----------
  const resetMessages = useCallback(() => {
    messageIdsRef.current = new Set();
    setMessages([]);
  }, []);

  const appendMessage = useCallback((msg: ChatMessageInfo) => {
    if (messageIdsRef.current.has(msg.id)) return;
    messageIdsRef.current.add(msg.id);
    setMessages((prev) => [...prev, msg]);
  }, []);

  // 选中会话：加载第一页消息 + 标记已读 + 清空未读
  const selectRoomInternal = useCallback(
    async (roomId: string) => {
      setSelectedRoomId(roomId);
      resetMessages();
      setPage(1);
      setHasMore(false);
      setLoadingMessages(true);
      setError('');
      try {
        const data = await chatApi.listMessages(roomId, 1, PAGE_SIZE);
        const items = data.items || [];
        items.forEach((m) => messageIdsRef.current.add(m.id));
        setMessages(items);
        setHasMore(data.page * data.pageSize < data.total);
        // 标记已读
        chatApi.markRead(roomId).catch(() => {});
        // 清空侧栏未读
        setFriends((prev) =>
          prev.map((f) => (f.roomId === roomId ? { ...f, unreadCount: 0 } : f))
        );
        setRooms((prev) =>
          prev.map((r) => (r.id === roomId ? { ...r, unreadCount: 0 } : r))
        );
      } catch (err: any) {
        setError(err.response?.data?.message || '');
      } finally {
        setLoadingMessages(false);
      }
    },
    [resetMessages]
  );

  const handleSelectFriend = useCallback(
    (friend: FriendInfo) => {
      selectRoomInternal(friend.roomId);
    },
    [selectRoomInternal]
  );

  const handleSelectRoom = useCallback(
    (room: RoomInfo) => {
      selectRoomInternal(room.id);
    },
    [selectRoomInternal]
  );

  // 加载更多历史消息
  const handleLoadMore = useCallback(async () => {
    if (!selectedRoomId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const data = await chatApi.listMessages(selectedRoomId, nextPage, PAGE_SIZE);
      const items = data.items || [];
      const newOnes = items.filter((m) => !messageIdsRef.current.has(m.id));
      newOnes.forEach((m) => messageIdsRef.current.add(m.id));
      setMessages((prev) => [...newOnes, ...prev]);
      setPage(nextPage);
      setHasMore(data.page * data.pageSize < data.total);
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false);
    }
  }, [selectedRoomId, loadingMore, hasMore, page]);

  // 发送消息
  const handleSend = useCallback(async () => {
    if (!selectedRoomId || !input.trim() || sending) return;
    const content = input.trim();
    setSending(true);
    setError('');
    try {
      const msg = await chatApi.sendMessage(selectedRoomId, content);
      appendMessage(msg);
      // 更新侧栏最后消息
      setFriends((prev) =>
        prev.map((f) =>
          f.roomId === selectedRoomId
            ? { ...f, lastMessageContent: content, lastMessageAt: msg.createdAt }
            : f
        )
      );
      setRooms((prev) =>
        prev.map((r) =>
          r.id === selectedRoomId
            ? {
                ...r,
                lastMessageContent: content,
                lastMessageAt: msg.createdAt,
                lastMessageSenderName: msg.senderName,
              }
            : r
        )
      );
      setInput('');
    } catch (err: any) {
      setError(err.response?.data?.message || t('fellowship.sendMessage'));
    } finally {
      setSending(false);
    }
  }, [selectedRoomId, input, sending, appendMessage, t]);

  // 发送图片消息
  const handleSendImage = useCallback(
    async (file: File) => {
      if (!selectedRoomId || sending) return;
      setSending(true);
      setError('');
      try {
        const msg = await chatApi.sendImageMessage(selectedRoomId, file);
        appendMessage(msg);
        const preview = '[图片]';
        setFriends((prev) =>
          prev.map((f) =>
            f.roomId === selectedRoomId
              ? { ...f, lastMessageContent: preview, lastMessageAt: msg.createdAt }
              : f
          )
        );
        setRooms((prev) =>
          prev.map((r) =>
            r.id === selectedRoomId
              ? {
                  ...r,
                  lastMessageContent: preview,
                  lastMessageAt: msg.createdAt,
                  lastMessageSenderName: msg.senderName,
                }
              : r
          )
        );
      } catch (err: any) {
        setError(err.response?.data?.message || t('fellowship.sendImageFailed'));
      } finally {
        setSending(false);
      }
    },
    [selectedRoomId, sending, appendMessage, t]
  );

  // 发送语音消息
  const handleSendAudio = useCallback(
    async (file: File) => {
      if (!selectedRoomId || sending) return;
      setSending(true);
      setError('');
      try {
        const msg = await chatApi.sendAudioMessage(selectedRoomId, file);
        appendMessage(msg);
        const preview = '[语音]';
        setFriends((prev) =>
          prev.map((f) =>
            f.roomId === selectedRoomId
              ? { ...f, lastMessageContent: preview, lastMessageAt: msg.createdAt }
              : f
          )
        );
        setRooms((prev) =>
          prev.map((r) =>
            r.id === selectedRoomId
              ? {
                  ...r,
                  lastMessageContent: preview,
                  lastMessageAt: msg.createdAt,
                  lastMessageSenderName: msg.senderName,
                }
              : r
          )
        );
      } catch (err: any) {
        setError(err.response?.data?.message || t('fellowship.sendVoiceFailed'));
      } finally {
        setSending(false);
      }
    },
    [selectedRoomId, sending, appendMessage, t]
  );

  // ---------- WebSocket 全局监听：更新侧栏 ----------
  useEffect(() => {
    const unsubscribe = subscribeAll((message) => {
      const currentSelected = selectedRoomIdRef.current;
      const isSelfMsg = message.senderId === currentUserId;
      // 好友列表更新
      setFriends((prev) =>
        prev.map((f) => {
          if (f.roomId !== message.roomId) return f;
          return {
            ...f,
            lastMessageContent: message.content,
            lastMessageAt: message.createdAt,
            // 当前房间不累加未读；自己的消息也不累加
            unreadCount:
              message.roomId === currentSelected || isSelfMsg
                ? 0
                : f.unreadCount + 1,
          };
        })
      );
      // 群聊列表更新
      setRooms((prev) =>
        prev.map((r) => {
          if (r.id !== message.roomId) return r;
          return {
            ...r,
            lastMessageContent: message.content,
            lastMessageAt: message.createdAt,
            lastMessageSenderName: message.senderName,
            unreadCount:
              message.roomId === currentSelected || isSelfMsg
                ? 0
                : r.unreadCount + 1,
          };
        })
      );
    });
    return unsubscribe;
  }, [subscribeAll, currentUserId]);

  // ---------- WebSocket 房间订阅：追加消息 + 标记已读 ----------
  useEffect(() => {
    if (!selectedRoomId) return;
    const unsubscribe = subscribe(selectedRoomId, (message) => {
      appendMessage(message);
      // 收到他人消息时标记已读（自己的消息不需要）
      if (message.senderId !== currentUserId) {
        chatApi.markRead(selectedRoomId).catch(() => {});
      }
    });
    return unsubscribe;
  }, [selectedRoomId, subscribe, appendMessage, currentUserId]);

  // ---------- 好友请求处理 ----------
  const handleAcceptRequest = useCallback(
    async (requestId: string) => {
      try {
        await chatApi.acceptFriendRequest(requestId);
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
        await loadFriends();
      } catch (err: any) {
        setError(err.response?.data?.message || '');
      }
    },
    [loadFriends]
  );

  const handleRejectRequest = useCallback(
    async (requestId: string) => {
      try {
        await chatApi.rejectFriendRequest(requestId);
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      } catch (err: any) {
        setError(err.response?.data?.message || '');
      }
    },
    []
  );

  // ---------- 删除好友 ----------
  const handleDeleteFriend = useCallback(async () => {
    const friend = friends.find((f) => f.roomId === selectedRoomId);
    if (!friend) return;
    if (!confirm(t('fellowship.confirmDeleteFriend'))) return;
    try {
      await chatApi.deleteFriend(friend.friendId);
      setSelectedRoomId(null);
      await loadFriends();
    } catch (err: any) {
      setError(err.response?.data?.message || '');
    }
  }, [friends, selectedRoomId, t, loadFriends]);

  // ---------- 退出群聊 ----------
  const handleLeaveRoom = useCallback(async () => {
    if (!selectedRoomId) return;
    if (!confirm(t('fellowship.confirmLeaveRoom'))) return;
    try {
      await chatApi.leaveRoom(selectedRoomId);
      setSelectedRoomId(null);
      await loadRooms();
    } catch (err: any) {
      setError(err.response?.data?.message || '');
    }
  }, [selectedRoomId, t, loadRooms]);

  // ---------- 创建群聊 ----------
  const handleCreateRoom = useCallback(
    async (name: string, memberIds: string[]) => {
      await chatApi.createRoom(name, memberIds);
      await loadRooms();
      setActiveTab('rooms');
    },
    [loadRooms]
  );

  // ---------- 邀请成员进群 ----------
  // 点击 ChatWindow「邀请成员」按钮时，先拉取当前群成员用于排除，再打开邀请弹窗
  const handleOpenInvite = useCallback(async () => {
    if (!selectedRoomId) return;
    try {
      const members = await chatApi.listRoomMembers(selectedRoomId);
      setInviteExistingIds(new Set((members || []).map((m) => m.userId)));
    } catch {
      setInviteExistingIds(new Set());
    }
    setShowInvite(true);
  }, [selectedRoomId]);

  // 提交邀请：调用 API 拉人，成功后刷新群列表（成员数更新）
  const handleInviteMembers = useCallback(
    async (memberIds: string[]) => {
      if (!selectedRoomId) return;
      await chatApi.addRoomMembers(selectedRoomId, memberIds);
      await loadRooms();
      // 同步刷新成员列表（若 MembersModal 打开则其内部会自行刷新，这里仅更新群列表）
    },
    [selectedRoomId, loadRooms]
  );

  // ---------- 当前会话信息（用于 ChatWindow 头部） ----------
  const selectedFriend = friends.find((f) => f.roomId === selectedRoomId) || null;
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || null;
  const selectedInfo = selectedFriend
    ? {
        title: selectedFriend.displayName || selectedFriend.username,
        avatarUrl: selectedFriend.avatarUrl,
        isRoom: false,
      }
    : selectedRoom
    ? {
        title: selectedRoom.name,
        avatarUrl: selectedRoom.avatarUrl,
        isRoom: true,
        memberCount: selectedRoom.memberCount,
      }
    : null;

  // 移动端返回列表
  const handleBack = useCallback(() => {
    setSelectedRoomId(null);
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0]">
        <div className="text-amber-700 text-lg animate-pulse">
          {t('fellowship.connecting')}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 flex flex-col bg-[#FDF8F0] z-30"
      style={{ height: '100dvh' }}
    >
      {/* 顶部栏：返回首页 + 标题，固定高度 */}
      <div className="flex-shrink-0 bg-white border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">{t('fellowship.title')}</span>
          </button>
          <span
            className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
              connected ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
            {connected ? t('fellowship.connected') : t('fellowship.connecting')}
          </span>
        </div>
      </div>

      {/* 主体：填满顶部栏之下的剩余空间，左右分栏（桌面），切换显示（移动）
          完整 flex 链路：root(100dvh, flex-col) → 顶部栏(flex-shrink-0) → 主体(flex-1 min-h-0, flex-col)
          → 卡片(flex-1 min-h-0, flex row) → 侧栏/聊天(flex-shrink-0/flex-1, min-h-0)
          全程避免 h-full，因 h-full 在 flex-1 父项上在 iOS Safari 中可能无法解析高度 */}
      <div className="flex-1 min-h-0 w-full max-w-6xl mx-auto px-2 sm:px-4 py-2 sm:py-3 flex flex-col">
        <div className="flex-1 min-h-0 flex bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
          {/* 侧栏：桌面常驻，移动端仅在未选中会话时显示 */}
          <div
            className={`${
              selectedRoomId ? 'hidden md:flex' : 'flex'
            } flex-col w-full md:w-72 lg:w-80 flex-shrink-0 min-h-0`}
          >
            <Sidebar
              friends={friends}
              rooms={rooms}
              requests={requests}
              activeTab={activeTab}
              selectedRoomId={selectedRoomId}
              connected={connected}
              onTabChange={setActiveTab}
              onSelectFriend={handleSelectFriend}
              onSelectRoom={handleSelectRoom}
              onOpenAddFriend={() => setShowAddFriend(true)}
              onOpenRequests={() => setShowRequests(true)}
              onOpenCreateRoom={() => setShowCreateRoom(true)}
            />
          </div>

          {/* 聊天窗口：桌面常驻，移动端仅在选中会话时全屏显示 */}
          <div
            className={`${
              selectedRoomId ? 'flex' : 'hidden md:flex'
            } flex-col flex-1 min-w-0 min-h-0`}
          >
            {selectedInfo ? (
              <ChatWindow
                title={selectedInfo.title}
                avatarUrl={selectedInfo.avatarUrl}
                isRoom={selectedInfo.isRoom}
                memberCount={selectedInfo.isRoom ? selectedInfo.memberCount : undefined}
                messages={messages}
                currentUserId={currentUserId}
                loadingMessages={loadingMessages}
                loadingMore={loadingMore}
                hasMore={hasMore}
                input={input}
                sending={sending}
                error={error}
                onInputChange={setInput}
                onSend={handleSend}
                onSendImage={handleSendImage}
                onSendAudio={handleSendAudio}
                onLoadMore={handleLoadMore}
                onBack={handleBack}
                onOpenMembers={() => setShowMembers(true)}
                onInviteMembers={handleOpenInvite}
                onLeaveRoom={handleLeaveRoom}
                onDeleteFriend={handleDeleteFriend}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-[#FDF8F0]">
                <div className="text-center text-gray-400">
                  <svg
                    className="w-16 h-16 mx-auto mb-3 text-amber-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-sm">{t('fellowship.noMessages')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 弹窗 */}
      {showAddFriend && (
        <AddFriendModal
          onClose={() => setShowAddFriend(false)}
          onDone={() => {
            // 发送请求后刷新请求列表
            loadRequests();
          }}
        />
      )}
      {showRequests && (
        <FriendRequestsModal
          requests={requests}
          onClose={() => setShowRequests(false)}
          onAccept={handleAcceptRequest}
          onReject={handleRejectRequest}
        />
      )}
      {showCreateRoom && (
        <CreateRoomModal
          friends={friends}
          onClose={() => setShowCreateRoom(false)}
          onCreate={handleCreateRoom}
        />
      )}
      {showMembers && selectedRoomId && (
        <MembersModal
          roomId={selectedRoomId}
          friends={friends}
          onClose={() => setShowMembers(false)}
          onMembersChanged={loadRooms}
        />
      )}
      {showInvite && selectedRoomId && (
        <AddMembersModal
          friends={friends}
          existingMemberIds={inviteExistingIds}
          onClose={() => setShowInvite(false)}
          onAdd={handleInviteMembers}
        />
      )}
    </div>
  );
}
