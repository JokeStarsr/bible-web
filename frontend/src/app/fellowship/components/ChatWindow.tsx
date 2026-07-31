'use client';

import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import type { ChatMessageInfo } from '@/services/chatApi';
import { useI18n } from '@/i18n/I18nContext';
import Avatar from './Avatar';
import { formatMessageTime } from './timeUtils';

// 常用表情集合（unicode 字符，作为普通文本消息发送）
const EMOJI_LIST = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆',
  '😉', '😊', '😋', '😍', '😘', '🥰', '😗', '😙',
  '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑',
  '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯',
  '😪', '😫', '🥱', '😴', '😌', '😛', '😜', '😝',
  '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲',
  '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧',
  '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶',
  '😳', '🤪', '😵', '🥳', '🥺', '🤠', '🤡', '😇',
  '🙏', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤙',
  '👋', '🤝', '💪', '❤️', '🧡', '💛', '💚', '💙',
  '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞',
  '🔥', '✨', '🌟', '⭐', '🌈', '☀️', '☁️', '🌧️',
  '⛪', '✝️', '🕊️', '📖', '🙏🏻', '👑', '🌱', '🌸',
];

// 消息内容类型
const MSG_TYPE_TEXT = 'TEXT';
const MSG_TYPE_IMAGE = 'IMAGE';
const MSG_TYPE_AUDIO = 'AUDIO';

interface ChatWindowProps {
  title: string;
  avatarUrl?: string;
  isRoom: boolean;
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
  onSendImage: (file: File) => void;
  onSendAudio: (file: File) => void;
  onLoadMore: () => void;
  onBack: () => void;
  onOpenMembers: () => void;
  onLeaveRoom: () => void;
  onDeleteFriend: () => void;
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
  onSendImage,
  onSendAudio,
  onLoadMore,
  onBack,
  onOpenMembers,
  onLeaveRoom,
  onDeleteFriend,
}: ChatWindowProps) {
  const { t } = useI18n();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 表情面板显示
  const [showEmoji, setShowEmoji] = useState(false);

  // 语音录制状态
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  useEffect(() => {
    if (autoScrollRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sortedMessages.length]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    autoScrollRef.current = distanceFromBottom < 80;
    if (el.scrollTop === 0 && hasMore && !loadingMore && !loadingMessages) {
      const prevScrollHeight = el.scrollHeight;
      onLoadMore();
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

  useEffect(() => {
    autoScrollRef.current = true;
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [title]);

  // 关闭表情面板（点击外部）
  useEffect(() => {
    if (!showEmoji) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-emoji-panel]') && !target.closest('[data-emoji-btn]')) {
        setShowEmoji(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmoji]);

  // 选择表情：插入到输入框光标位置
  const handlePickEmoji = (emoji: string) => {
    onInputChange(input + emoji);
  };

  // ---------- 图片上传 ----------
  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // 清空，便于重复选择同一文件
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert(t('fellowship.imageTooLarge'));
      return;
    }
    onSendImage(file);
  };

  // ---------- 语音录制 ----------
  // 清理录音资源
  const cleanupRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((tr) => tr.stop());
      streamRef.current = null;
    }
    setRecording(false);
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => cleanupRecording();
  }, [cleanupRecording]);

  // 选取浏览器支持的音频 MIME 类型
  const pickAudioMime = (): string => {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];
    for (const c of candidates) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(c)) {
        return c;
      }
    }
    return '';
  };

  // 推算文件扩展名
  const mimeToExt = (mime: string): string => {
    if (mime.includes('webm')) return '.webm';
    if (mime.includes('ogg')) return '.ogg';
    if (mime.includes('mp4')) return '.m4a';
    return '.audio';
  };

  const handleToggleRecord = async () => {
    if (recording) {
      // 正在录音：停止 → 自动发送
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      return;
    }
    // 开始录音
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      alert(t('fellowship.sendVoiceFailed'));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickAudioMime();
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mime || 'audio/webm',
        });
        const usedMime = mime || blob.type || 'audio/webm';
        const ext = mimeToExt(usedMime);
        const file = new File([blob], `voice_${Date.now()}${ext}`, { type: usedMime });
        // 释放麦克风
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((tr) => tr.stop());
          streamRef.current = null;
        }
        setRecording(false);
        if (file.size > 5 * 1024 * 1024) {
          alert(t('fellowship.voiceTooLarge'));
          return;
        }
        if (file.size > 0) {
          onSendAudio(file);
        }
      };
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error('录音启动失败', err);
      alert(t('fellowship.sendVoiceFailed'));
      cleanupRecording();
    }
  };

  const handleCancelRecord = () => {
    // 取消：标记并停止，onstop 中因 recording 已置 false 且不调用发送
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // 先替换 onstop，避免触发发送
      mediaRecorderRef.current.onstop = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((tr) => tr.stop());
          streamRef.current = null;
        }
      };
      try { mediaRecorderRef.current.stop(); } catch { /* ignore */ }
    }
    chunksRef.current = [];
    mediaRecorderRef.current = null;
    setRecording(false);
  };

  // ---------- 消息内容渲染 ----------
  const renderMessageContent = (msg: ChatMessageInfo, isSelf: boolean) => {
    if (msg.type === MSG_TYPE_IMAGE) {
      // 图片消息：content 是图片 URL
      return (
        <img
          src={msg.content}
          alt="image"
          className="max-w-[220px] max-h-[220px] rounded-lg cursor-pointer object-cover"
          onClick={() => window.open(msg.content, '_blank')}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }
    if (msg.type === MSG_TYPE_AUDIO) {
      // 语音消息：content 是音频 URL
      return (
        <audio
          controls
          src={msg.content}
          className="max-w-[240px] h-9"
          style={{ filter: isSelf ? 'invert(0.9)' : 'none' }}
        />
      );
    }
    // 文本消息（含表情，表情是 unicode 字符直接显示）
    return <span className="whitespace-pre-wrap break-words">{msg.content}</span>;
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-white overflow-hidden">
      {/* 顶部 */}
      <div className="flex flex-shrink-0 items-center justify-between px-3 py-2.5 border-b border-amber-100">
        <div className="flex items-center gap-2 min-w-0">
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
        className="flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-3 bg-[#FDF8F0]"
      >
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
            const showSender =
              isRoom && !isSelf && (!prev || prev.senderId !== msg.senderId);
            const isImage = msg.type === MSG_TYPE_IMAGE;
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
                      className={`px-3 py-2 text-sm ${
                        isImage
                          ? // 图片气泡去掉内边距，让图片贴边
                            (isSelf ? 'bg-amber-50 rounded-2xl rounded-br-sm' : 'bg-gray-50 rounded-2xl rounded-bl-sm')
                          : isSelf
                          ? 'bg-amber-500 text-white rounded-2xl rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm'
                      }`}
                    >
                      {renderMessageContent(msg, isSelf)}
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
        <div className="flex-shrink-0 px-3 py-1.5 text-xs text-red-500 bg-red-50 border-t border-red-100">
          {error}
        </div>
      )}

      {/* 录音状态条 */}
      {recording && (
        <div className="flex flex-shrink-0 items-center justify-between px-3 py-2 bg-red-50 border-t border-red-100">
          <span className="flex items-center gap-2 text-sm text-red-600">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            {t('fellowship.recording')}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelRecord}
              className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
            >
              {t('fellowship.cancelRecord')}
            </button>
            <button
              onClick={handleToggleRecord}
              className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full"
            >
              {t('fellowship.releaseToSend')}
            </button>
          </div>
        </div>
      )}

      {/* 表情面板 */}
      {showEmoji && (
        <div
          data-emoji-panel
          className="flex-shrink-0 border-t border-amber-100 bg-white p-2 max-h-48 overflow-y-auto"
        >
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_LIST.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => handlePickEmoji(emoji)}
                className="w-9 h-9 flex items-center justify-center text-xl hover:bg-amber-50 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 隐藏的图片文件选择器 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 输入框：两行布局，避免手机端按钮挤压 */}
      <div className="flex-shrink-0 border-t border-amber-100 p-2">
        {/* 工具按钮行：左工具，右发送 */}
        <div className="flex items-center gap-1 mb-1.5">
          {/* 表情按钮 */}
          <button
            data-emoji-btn
            onClick={() => setShowEmoji((v) => !v)}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
              showEmoji ? 'bg-amber-100 text-amber-600' : 'text-gray-500 hover:bg-gray-100 hover:text-amber-600'
            }`}
            aria-label={t('fellowship.emoji')}
            title={t('fellowship.emoji')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {/* 图片按钮 */}
          <button
            onClick={handlePickImage}
            disabled={sending}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-amber-600 disabled:opacity-50 transition-colors flex-shrink-0"
            aria-label={t('fellowship.image')}
            title={t('fellowship.image')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          {/* 语音按钮 */}
          <button
            onClick={handleToggleRecord}
            disabled={sending}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
              recording ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-amber-600'
            } disabled:opacity-50`}
            aria-label={t('fellowship.voice')}
            title={recording ? t('fellowship.releaseToSend') : t('fellowship.clickToRecord')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 7v3m-4 0h8m-4-7a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          {/* 占位撑开，把发送按钮推到右侧 */}
          <div className="flex-1" />
          <button
            onClick={onSend}
            disabled={sending || !input.trim()}
            className="px-3 py-1.5 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {sending ? '...' : t('fellowship.sendMessage')}
          </button>
        </div>
        {/* 输入框行：占满整行 */}
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('fellowship.messagePlaceholder')}
          rows={1}
          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 resize-none max-h-24"
        />
      </div>
    </div>
  );
}
