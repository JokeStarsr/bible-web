'use client';

import { useState } from 'react';
import type { FriendInfo } from '@/services/chatApi';
import { useI18n } from '@/i18n/I18nContext';
import Avatar from './Avatar';

interface CreateRoomModalProps {
  friends: FriendInfo[];
  onClose: () => void;
  onCreate: (name: string, memberIds: string[]) => Promise<void>;
}

export default function CreateRoomModal({ friends, onClose, onCreate }: CreateRoomModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const toggle = (friendId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(friendId)) {
        next.delete(friendId);
      } else {
        next.add(friendId);
      }
      return next;
    });
  };

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed || selected.size === 0 || creating) return;
    setCreating(true);
    setError('');
    try {
      await onCreate(trimmed, Array.from(selected));
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || t('fellowship.createRoom'));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-amber-100">
          <h2 className="text-base font-bold text-amber-800">{t('fellowship.createRoom')}</h2>
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

        {/* 群名输入 */}
        <div className="p-4 border-b border-amber-50">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('fellowship.roomNamePlaceholder')}
            className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
          />
          <p className="text-xs text-gray-400 mt-2">
        {t('fellowship.selectFriends')} ({selected.size})
          </p>
        </div>

        {/* 好友选择列表 */}
        <div className="flex-1 overflow-y-auto">
          {friends.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">
              {t('fellowship.noFriends')}
            </div>
          ) : (
            friends.map((f) => {
              const checked = selected.has(f.friendId);
              return (
                <button
                  key={f.friendId}
                  onClick={() => toggle(f.friendId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 ${
                    checked ? 'bg-amber-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <Avatar
                    name={f.displayName || f.username}
                    avatarUrl={f.avatarUrl}
                    size={36}
                  />
                  <p className="flex-1 text-sm font-medium text-gray-800 truncate">
                    {f.displayName || f.username}
                  </p>
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      checked
                        ? 'bg-amber-500 border-amber-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {checked && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* 底部操作 */}
        <div className="px-4 py-3 border-t border-amber-100 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            {t('fellowship.cancel')}
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !name.trim() || selected.size === 0}
            className="flex-1 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? '...' : t('fellowship.create')}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 px-4 pb-2">{error}</p>}
      </div>
    </div>
  );
}
