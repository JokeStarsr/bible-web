'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { messageApi } from '@/services/api';
import { useI18n } from '@/i18n/I18nContext';

interface UserInfo {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

interface SessionItem {
  id: string;
  otherUser: UserInfo;
  status: string;
  lastMessageAt: string;
  createdAt: string;
}

interface MessageItem {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function MessagesPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 聊天弹窗
  const [activeSession, setActiveSession] = useState<SessionItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    } catch { /* ignore */ }
    setCheckingAuth(false);
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await messageApi.listSessions(1, 50);
      setSessions(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || t('messages.loadFail'));
    } finally {
      setLoading(false);
    }
  };

  const openChat = useCallback(async (session: SessionItem) => {
    setActiveSession(session);
    setInput('');
    try {
      const res = await messageApi.listMessages(session.id, 1, 100);
      setMessages(res.data.data || []);
    } catch {
      setMessages([]);
    }
    // 定时轮询
    if (chatPollRef.current) clearInterval(chatPollRef.current);
    chatPollRef.current = setInterval(async () => {
      try {
        const res = await messageApi.listMessages(session.id, 1, 100);
        setMessages(res.data.data || []);
      } catch { /* ignore */ }
    }, 5000);
  }, []);

  const closeChat = useCallback(() => {
    setActiveSession(null);
    setMessages([]);
    if (chatPollRef.current) {
      clearInterval(chatPollRef.current);
      chatPollRef.current = null;
    }
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!activeSession || !input.trim() || sending) return;
    setSending(true);
    try {
      const res = await messageApi.sendMessage(activeSession.id, input.trim());
      setMessages((prev) => [...prev, res.data.data]);
      setInput('');
    } catch (err: any) {
      setError(err.response?.data?.message || t('messages.sendFail'));
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-bible-gold text-lg animate-pulse">正在确认登录状态...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pt-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1 text-bible-muted hover:text-bible-gold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </button>
      </div>

      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-bible-dark mb-3">私信</h1>
        <p className="text-bible-muted">与主内肢体彼此劝勉、互相鼓励</p>
      </div>

      {loading ? (
        <div className="text-center text-bible-muted py-8">
          <div className="animate-pulse">{t("messages.checkingAuth")}</div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">{error}</div>
      ) : sessions.length === 0 ? (
        <div className="text-center text-bible-muted py-12 space-y-3">
          <div className="w-16 h-16 mx-auto bg-bible-warm/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-bible-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p>暂无私信会话</p>
          <p className="text-sm">
            在首页生成经文后，划选经文写下公开默想，即可与有相同感动的肢体建立私信连接。
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary inline-block"
          >
            去生成经文
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => openChat(s)}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-white border border-bible-warm hover:border-bible-gold hover:shadow-md transition-all text-left"
            >
              <div className="w-10 h-10 rounded-full bg-bible-gold/10 border border-bible-gold/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                {s.otherUser.avatarUrl ? (
                  <img
                    src={s.otherUser.avatarUrl}
                    alt={s.otherUser.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-bible-gold font-bold">
                    {(s.otherUser.displayName || '?').charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-bible-dark">
                    {s.otherUser.displayName}
                  </p>
                  <span className="text-xs text-bible-muted">
                    {s.lastMessageAt ? formatTime(s.lastMessageAt) : ''}
                  </span>
                </div>
              </div>
              <svg className="w-4 h-4 text-bible-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* 聊天弹窗 */}
      {activeSession && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeChat();
          }}
        >
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:w-full h-[80vh] sm:h-auto sm:max-h-[80vh] flex flex-col overflow-hidden">
            {/* 头部 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-bible-warm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-bible-gold/10 border border-bible-gold/30 flex items-center justify-center overflow-hidden">
                  {activeSession.otherUser.avatarUrl ? (
                    <img
                      src={activeSession.otherUser.avatarUrl}
                      alt={activeSession.otherUser.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-bible-gold font-bold">
                      {(activeSession.otherUser.displayName || '?').charAt(0)}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-bible-dark">
                  {activeSession.otherUser.displayName}
                </p>
              </div>
              <button
                onClick={closeChat}
                className="text-bible-muted hover:text-bible-dark p-1"
                aria-label="关闭"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 消息列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center text-bible-muted py-8 text-sm">
                  可以开始说话了，愿你们在主里彼此鼓励。
                </div>
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.senderId === currentUserId;
                  return (
                    <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                          isSelf
                            ? 'bg-bible-gold text-white rounded-br-none'
                            : 'bg-bible-light text-bible-dark rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 底部输入 */}
            <div className="border-t border-bible-warm p-3">
              {error && <div className="text-red-500 text-xs mb-2 px-1">{error}</div>}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="输入消息..."
                  disabled={sending}
                  className="flex-1 px-3 py-2 text-sm border border-bible-warm rounded-full focus:outline-none focus:border-bible-gold"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="w-9 h-9 rounded-full bg-bible-gold text-white flex items-center justify-center disabled:opacity-50 hover:bg-amber-600 transition-colors"
                  aria-label="发送"
                >
                  {sending ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}