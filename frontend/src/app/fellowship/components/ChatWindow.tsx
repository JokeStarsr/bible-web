'use client';

import { useEffect, useRef, useMemo } from 'react';
import type { ChatMessageInfo } from '@/services/chatApi';
import { useI18n } from '@/i18n/I18nContext';
import Avatar from './Avatar';
import { formatMessageTime } from './timeUtils';

interface ChatWindowProps {
  // 当前会话标题（好友 displayName 或群名）
  title: string;
  // 当前会话头像
  avatarUrl?: string;
  // 是否为群聊（决定是否显示发送者名称、成员数、退群按钮）
  isRoom: boolean;
  // 群成员数（仅群聊）
  memberCount?: number;
  messages: ChatMessageInfo[];
  currentUserId: string | undefined;
  loadingMessages: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  input: string;
  sending: boolean;
  error: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onLoadMore: () => void;
  onBack: () => void; // 移动端返回列表
  onOpenMembers: () => void; // 查看群成员
  onLeaveRoom: () => void; // 退群
  onDeleteFriend: () => void; // 删好友
}

export default function ChatWindow({
  title,
  avatarUrl,
  isRoom,
  memberCount,
  messages,
  currentUserId,
  loadingMessages,
  loadingMore,
  hasMore,
  input,
  sending,
  error,
  onInputChange,
  onSend,
  onLoadMore,
  onBack,
  onOpenMembers,
  onLeaveRoom,
  onDeleteFriend,
}: ChatWindowProps) {
  const { t } = useI18n();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  // 是否自动滚动到底部（用户向上看历史时不强制滚到底）
  const autoScrollRef = useRef(true);

  // 消息列表使用 useMemo 避免每次渲染重建
  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  // 收到新消息或切换会话时，若用户在底部附近则自动滚动
  useEffect(() => {
    if (autoScrollRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sortedMessages.length]);

  // 监听滚动，决定是否自动滚到底
  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    autoScrollRef.current = distanceFromBottom < 80;
    // 滚到顶部加载更多
    if (el.scrollTop === 0 && hasMore && !loadingMore && !loadingMessages) {
      const prevScrollHeight = el.scrollHeight;
      onLoadMore();
      // 加载完成后保留滚动位置（在 onLoadMore 完成后调整）
      setTimeout(() => {
        const newEl = messagesContainerRef.current;
        if (newEl) {
          newEl.scrollTop = newEl.scrollHeight - prevScrollHeight;
        }
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // 切换会话时重置自动滚动
  useEffect(() => {
    autoScrollRef.current = true;
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [title]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 顶部 */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-amber-100">
        <div className="flex items-center gap-2 min-w-0">
          {/* 移动端返回按钮 */}
          <button
            onClick={onBack}
            className="md:hidden p-1 text-gray-500 hover:text-amber-600 transition-colors flex-shrink-0"
            aria-label="back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <Avatar name={title} avatarUrl={avatarUrl} size={32} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{title}</p>
            {isRoom && (
              <button
                onClick={onOpenMembers}
                className="text-xs text-gray-400 hover:text-amber-600 transition-colors"
              >
                {memberCount ?? 0}
                {t('fellowship.memberCount')}
              </button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isRoom ? (
            <button
              onClick={onLeaveRoom}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
            >
              {t('fellowship.leaveRoom')}
            </button>
          ) : (
            <button
              onClick={onDeleteFriend}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1"
            >
              {t('fellowship.deleteFriend')}
            </button>
          )}
        </div>
      </div>

      {/* 消息列表 */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-[#FDF8F0]"
      >
        {/* 加载更多 */}
        {hasMore && (
          <div className="text-center">
            {loadingMore ? (
              <span className="text-xs text-gray-400">{t('fellowship.loadMore')}...</span>
            ) : (
              <button
                onClick={onLoadMore}
                className="text-xs text-amber-600 hover:text-amber-700"
              >
                {t('fellowship.loadMore')}
              </button>
            )}
          </div>
        )}
        {!hasMore && sortedMessages.length > 0 && (
          <div className="text-center text-xs text-gray-300">
            {t('fellowship.noMoreMessages')}
          </div>
        )}

        {loadingMessages ? (
          <div className="text-center text-gray-400 text-sm py-8">{t('fellowship.connecting')}</div>
        ) : sortedMessages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-12">
            {t('fellowship.noMessages')}
          </div>
        ) : (
          sortedMessages.map((msg, idx) => {
            const isSelf = msg.senderId === currentUserId;
            const prev = sortedMessages[idx - 1];
            // 是否需要显示发送者名称（群聊且与上一条不同发送者）
            const showSender =
              isRoom && !isSelf && (!prev || prev.senderId !== msg.senderId);
            return (
              <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end gap-1.5 max-w-[80%] ${isSelf ? 'flex-row-reverse' : ''}`}>
                  {!isSelf && (
                    <Avatar
                      name={msg.senderName}
                      avatarUrl={msg.senderAvatarUrl}
                      size={28}
                    />
                  )}
                  <div className={isSelf ? 'items-end' : 'items-start'}>
                    {showSender && (
                      <p className="text-xs text-gray-500 mb-0.5 px-1">{msg.senderName}</p>
                    )}
                    <div
                      className={`px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                        isSelf
                          ? 'bg-amber-500 text-white rounded-2xl rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p
                      className={`text-[10px] text-gray-400 mt-0.5 px-1 ${
                        isSelf ? 'text-right' : 'text-left'
                      }`}
                    >
                      {formatMessageTime(msg.createdAt, t)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-3 py-1.5 text-xs text-red-500 bg-red-50 border-t border-red-100">
          {error}
        </div>
      )}

      {/* 输入框 */}
      <div className="border-t border-amber-100 p-2.5">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('fellowship.messagePlaceholder')}
            rows={1}
            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 resize-none max-h-24"
          />
          <button
            onClick={onSend}
            disabled={sending || !input.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-xl hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {sending ? '...' : t('fellowship.sendMessage')}
          </button>
        </div>
      </div>
    </div>
  );
}
