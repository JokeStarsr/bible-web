'use client';

import { useEffect, useRef, useState } from 'react';
import { messageApi } from '@/services/api';

interface AuthorInfo {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

interface Message {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function ChatModal({
  targetUser,
  currentUserId,
  onClose,
}: {
  targetUser: AuthorInfo;
  currentUserId?: string;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [canMessage, setCanMessage] = useState(false);
  const [commonCount, setCommonCount] = useState(0);
  const [requiredCount, setRequiredCount] = useState(20);
  const [error, setError] = useState('');

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 检查私信权限并创建/获取会话
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setLoading(true);
      setError('');
      try {
        const canRes = await messageApi.canMessage(targetUser.id);
        const canData = canRes.data.data;
        setCanMessage(canData.canMessage);
        setCommonCount(canData.commonAnnotations);
        setRequiredCount(canData.requiredAnnotations);

        if (!canData.canMessage) {
          setLoading(false);
          return;
        }

        const sessionRes = await messageApi.createSession(targetUser.id);
        if (cancelled) return;
        const sid = sessionRes.data.data.id;
        setSessionId(sid);
        const messagesRes = await messageApi.listMessages(sid, 1, 100);
        setMessages(messagesRes.data.data || []);
      } catch (err: any) {
        setError(err.response?.data?.message || '初始化私信失败');
      } finally {
        setLoading(false);
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, [targetUser.id]);

  // 定时轮询新消息
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      try {
        const res = await messageApi.listMessages(sessionId, 1, 100);
        setMessages(res.data.data || []);
      } catch {
        // 轮询失败不中断用户
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // 消息滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!sessionId || !input.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      const res = await messageApi.sendMessage(sessionId, input.trim());
      setMessages((prev) => [...prev, res.data.data]);
      setInput('');
    } catch (err: any) {
      setError(err.response?.data?.message || '发送失败');
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md sm:w-full h-[80vh] sm:h-auto sm:max-h-[80vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-bible-warm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-bible-gold/10 border border-bible-gold/30 flex items-center justify-center overflow-hidden">
              {targetUser.avatarUrl ? (
                <img
                  src={targetUser.avatarUrl}
                  alt={targetUser.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-bible-gold font-bold">
                  {(targetUser.displayName || '?').charAt(0)}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-bible-dark">{targetUser.displayName}</p>
              <p className="text-[10px] text-bible-muted">
                共同感动经文 {commonCount}/{requiredCount}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-bible-muted hover:text-bible-dark p-1"
            aria-label="关闭"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {loading ? (
            <div className="text-center text-bible-muted py-8 text-sm">正在检查私信权限...</div>
          ) : !canMessage ? (
            <div className="text-center py-10 px-4 space-y-3">
              <div className="w-14 h-14 mx-auto bg-bible-warm/50 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-bible-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <p className="text-bible-dark font-medium">暂不能发送私信</p>
              <p className="text-sm text-bible-muted">
                你们共同划线有感动的经文还需 <span className="text-bible-gold font-bold">{requiredCount - commonCount}</span> 条，
                达到 {requiredCount} 条后即可交流。
              </p>
            </div>
          ) : messages.length === 0 ? (
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
        {canMessage && !loading && (
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
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
