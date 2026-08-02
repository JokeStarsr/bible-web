'use client';

import { useState } from 'react';
import { chatApi, type SearchUserInfo } from '@/services/chatApi';
import { useI18n } from '@/i18n/I18nContext';
import Avatar from './Avatar';

interface AddFriendModalProps {
  onClose: () => void;
  onDone: () => void; // 发送请求后回调（可刷新请求列表）
}

export default function AddFriendModal({ onClose, onDone }: AddFriendModalProps) {
  const { t } = useI18n();
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<SearchUserInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const handleSearch = async () => {
    const kw = keyword.trim();
    if (!kw) return;
    setSearching(true);
    setError('');
    try {
      const data = await chatApi.searchUsers(kw);
      setResults(data || []);
      if (!data || data.length === 0) {
        setError(t('fellowship.userNotFound'));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('fellowship.userNotFound'));
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSend = async (user: SearchUserInfo) => {
    if (sendingId || sentIds.has(user.userId)) return;
    setSendingId(user.userId);
    setError('');
    try {
      await chatApi.sendFriendRequest(user.username, '');
      setSentIds((prev) => new Set(prev).add(user.userId));
      onDone();
    } catch (err: any) {
      // 用 errorCode 精确判断，避免消息文本模糊匹配误判
      // （后端 PENDING 提示「已发送好友请求...」也含「好友」二字，曾导致误显示「已经是好友」）
      const code = err.response?.data?.errorCode;
      const msg = err.response?.data?.message || '';
      if (code === 'ALREADY_FRIEND') {
        setError(t('fellowship.alreadyFriend'));
      } else if (code === 'REQUEST_PENDING') {
        // 后端已针对「发起方/接收方」返回精确文案，直接透传
        setError(msg || t('fellowship.requestSent'));
      } else {
        setError(msg || t('fellowship.userNotFound'));
      }
    } finally {
      setSendingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[70vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-amber-100">
          <h2 className="text-base font-bold text-amber-800">{t('fellowship.addFriend')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 搜索框 */}
        <div className="p-4 border-b border-amber-50">
          <div className="flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('fellowship.searchPlaceholder')}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !keyword.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {searching ? '...' : t('fellowship.search')}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>

        {/* 结果列表 */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {results.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-6">
              {keyword.trim() ? '' : t('fellowship.searchPlaceholder')}
            </div>
          ) : (
            results.map((u) => {
              const sent = sentIds.has(u.userId);
              return (
                <div
                  key={u.userId}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
                >
                  <Avatar name={u.displayName || u.username} avatarUrl={u.avatarUrl} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {u.displayName || u.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                  </div>
                  {u.isFriend ? (
                    <span className="text-xs text-gray-400 px-3 py-1">
                      {t('fellowship.alreadyFriend')}
                    </span>
                  ) : sent ? (
                    <span className="text-xs text-green-600 px-3 py-1">
                      {t('fellowship.requestSent')}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSend(u)}
                      disabled={sendingId === u.userId}
                      className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                    >
                      {sendingId === u.userId ? '...' : t('fellowship.addFriend')}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
