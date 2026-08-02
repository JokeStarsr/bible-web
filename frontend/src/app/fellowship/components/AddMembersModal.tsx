'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { chatApi, type FriendInfo, type SearchUserInfo } from '@/services/chatApi';
import { useI18n } from '@/i18n/I18nContext';
import Avatar from './Avatar';

/** 统一的候选用户结构（好友与搜索结果归一化） */
interface CandidateUser {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isFriend: boolean;
}

interface AddMembersModalProps {
  friends: FriendInfo[];
  /** 已在群内的成员 userId，邀请时排除 */
  existingMemberIds: Set<string>;
  onClose: () => void;
  onAdd: (memberIds: string[]) => Promise<void>;
}

export default function AddMembersModal({
  friends,
  existingMemberIds,
  onClose,
  onAdd,
}: AddMembersModalProps) {
  const { t } = useI18n();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  // 搜索状态：可搜索所有注册用户（不限于好友），用于拉非好友进群
  const [keyword, setKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchUserInfo[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 好友候选（排除已在群内），归一化为 CandidateUser
  const friendCandidates = useMemo<CandidateUser[]>(
    () =>
      friends
        .filter((f) => !existingMemberIds.has(f.friendId))
        .map((f) => ({
          userId: f.friendId,
          username: f.username,
          displayName: f.displayName,
          avatarUrl: f.avatarUrl,
          isFriend: true,
        })),
    [friends, existingMemberIds]
  );

  // 搜索结果候选（排除已在群内）
  const searchCandidates = useMemo<CandidateUser[]>(
    () =>
      searchResults
        .filter((u) => !existingMemberIds.has(u.userId))
        .map((u) => ({
          userId: u.userId,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          isFriend: u.isFriend,
        })),
    [searchResults, existingMemberIds]
  );

  // 有关键词时显示搜索结果，否则显示好友列表；搜索结果按 userId 去重
  const candidates = useMemo(() => {
    if (keyword.trim()) {
      const seen = new Set<string>();
      const merged: CandidateUser[] = [];
      for (const u of searchCandidates) {
        if (seen.add(u.userId)) merged.push(u);
      }
      return merged;
    }
    return friendCandidates;
  }, [keyword, searchCandidates, friendCandidates]);

  // 关键词变化时防抖搜索所有用户
  useEffect(() => {
    const kw = keyword.trim();
    if (!kw) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      chatApi
        .searchUsers(kw)
        .then((data) => setSearchResults(data || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [keyword]);

  const toggle = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleAdd = async () => {
    if (selected.size === 0 || adding) return;
    setAdding(true);
    setError('');
    try {
      await onAdd(Array.from(selected));
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || t('fellowship.inviteFailed'));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-amber-100">
          <h2 className="text-base font-bold text-amber-800">
            {t('fellowship.inviteMembers')}
          </h2>
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

        {/* 搜索框：可搜索所有注册用户拉进群（不限于好友） */}
        <div className="p-4 border-b border-amber-50 space-y-2">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('fellowship.searchUserToInvite')}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
            />
          </div>
          <p className="text-xs text-gray-400">
            {keyword.trim()
              ? `${t('fellowship.searchResults')} (${candidates.length})`
              : `${t('fellowship.selectFriends')} (${selected.size})`}
          </p>
        </div>

        {/* 候选列表（排除已在群内） */}
        <div className="flex-1 overflow-y-auto">
          {searching ? (
            <div className="text-center text-gray-400 text-sm py-10">...</div>
          ) : candidates.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-10">
              {keyword.trim()
                ? t('fellowship.noSearchResults')
                : t('fellowship.noFriendsToInvite')}
            </div>
          ) : (
            candidates.map((u) => {
              const checked = selected.has(u.userId);
              return (
                <button
                  key={u.userId}
                  onClick={() => toggle(u.userId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 ${
                    checked ? 'bg-amber-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <Avatar
                    name={u.displayName || u.username}
                    avatarUrl={u.avatarUrl}
                    size={36}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {u.displayName || u.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      @{u.username}
                      {!u.isFriend && (
                        <span className="ml-2 text-amber-500">{t('fellowship.notFriend')}</span>
                      )}
                    </p>
                  </div>
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                      checked ? 'bg-amber-500 border-amber-500' : 'border-gray-300'
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
            onClick={handleAdd}
            disabled={adding || selected.size === 0}
            className="flex-1 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {adding ? '...' : t('fellowship.invite')}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 px-4 pb-2">{error}</p>}
      </div>
    </div>
  );
}
