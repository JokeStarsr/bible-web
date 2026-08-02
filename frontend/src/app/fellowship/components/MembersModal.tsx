'use client';

import { useCallback, useEffect, useState } from 'react';
import { chatApi, type FriendInfo, type RoomMemberInfo } from '@/services/chatApi';
import { useI18n } from '@/i18n/I18nContext';
import Avatar from './Avatar';
import AddMembersModal from './AddMembersModal';

interface MembersModalProps {
  roomId: string;
  friends: FriendInfo[];
  /** 当前登录用户 ID，用于识别自己、避免添加自己为好友 */
  currentUserId?: string;
  onClose: () => void;
  /** 成员变更后通知父组件刷新群列表（成员数等） */
  onMembersChanged?: () => void;
  /** 好友请求发送成功后通知父组件刷新（请求列表/好友列表） */
  onFriendRequestSent?: () => void;
}

export default function MembersModal({
  roomId,
  friends,
  currentUserId,
  onClose,
  onMembersChanged,
  onFriendRequestSent,
}: MembersModalProps) {
  const { t } = useI18n();
  const [members, setMembers] = useState<RoomMemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // 点击成员 → 添加好友 相关状态
  const [selectedMember, setSelectedMember] = useState<RoomMemberInfo | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [addError, setAddError] = useState('');

  // 好友 userId 集合，用于判断成员是否已是好友
  const friendIds = new Set((friends || []).map((f) => f.friendId));

  const loadMembers = useCallback(() => {
    setLoading(true);
    chatApi
      .listRoomMembers(roomId)
      .then((data) => setMembers(data || []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [roomId]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const existingMemberIds = new Set(members.map((m) => m.userId));

  const handleAdd = async (memberIds: string[]) => {
    const updated = await chatApi.addRoomMembers(roomId, memberIds);
    setMembers(updated || []);
    onMembersChanged?.();
  };

  // 打开添加好友弹窗：重置状态
  const openAddFriend = (m: RoomMemberInfo) => {
    setSelectedMember(m);
    setSent(false);
    setAddError('');
    setSending(false);
  };

  // 发送好友请求（通过 username）
  const handleSendFriendRequest = async () => {
    if (!selectedMember || sending || sent) return;
    setSending(true);
    setAddError('');
    try {
      await chatApi.sendFriendRequest(selectedMember.username, '');
      setSent(true);
      onFriendRequestSent?.();
    } catch (err: any) {
      // 用 errorCode 精确判断，避免消息文本模糊匹配误判
      const code = err.response?.data?.errorCode;
      const msg = err.response?.data?.message || '';
      if (code === 'ALREADY_FRIEND') {
        setAddError(t('fellowship.alreadyFriend'));
      } else if (code === 'REQUEST_PENDING') {
        setAddError(msg || t('fellowship.requestSent'));
      } else {
        setAddError(msg || t('fellowship.userNotFound'));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
          {/* 头部 */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-amber-100">
            <h2 className="text-base font-bold text-amber-800">
              {t('fellowship.members')} ({members.length})
            </h2>
            <div className="flex items-center gap-3">
              {/* 邀请成员按钮 */}
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {t('fellowship.inviteMembers')}
              </button>
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
          </div>

          {/* 成员列表 */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="text-center text-gray-400 text-sm py-10">...</div>
            ) : members.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-10">
                {t('fellowship.noRooms')}
              </div>
            ) : (
              members.map((m) => {
                const isSelf = !!currentUserId && m.userId === currentUserId;
                const isFriend = friendIds.has(m.userId);
                return (
                  <div
                    key={m.userId}
                    className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 ${
                      isSelf ? '' : 'cursor-pointer hover:bg-amber-50/60 transition-colors'
                    }`}
                    onClick={() => {
                      if (isSelf) return;
                      openAddFriend(m);
                    }}
                  >
                    <Avatar
                      name={m.displayName || m.username}
                      avatarUrl={m.avatarUrl}
                      size={36}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {m.displayName || m.username}
                        {isSelf && (
                          <span className="ml-1 text-xs text-amber-600">({t('fellowship.you')})</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 truncate">@{m.username}</p>
                    </div>
                    {isSelf ? null : isFriend ? (
                      <span className="text-xs text-gray-400 px-2 py-1 shrink-0">
                        {t('fellowship.alreadyFriend')}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 px-2 py-1 shrink-0">
                        {t('fellowship.addFriend')}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 邀请成员子弹窗 */}
      {showAdd && (
        <AddMembersModal
          friends={friends}
          existingMemberIds={existingMemberIds}
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}

      {/* 点击成员 → 添加好友 子弹窗 */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget && !sending) {
              setSelectedMember(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-amber-100">
              <h2 className="text-base font-bold text-amber-800">{t('fellowship.addFriend')}</h2>
              <button
                onClick={() => setSelectedMember(null)}
                disabled={sending}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                aria-label="close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-5 flex flex-col items-center text-center">
              <Avatar
                name={selectedMember.displayName || selectedMember.username}
                avatarUrl={selectedMember.avatarUrl}
                size={64}
              />
              <p className="mt-3 text-base font-semibold text-gray-800 truncate max-w-full">
                {selectedMember.displayName || selectedMember.username}
              </p>
              <p className="text-xs text-gray-400 truncate max-w-full">@{selectedMember.username}</p>

              {sent ? (
                <p className="mt-4 text-sm text-green-600">{t('fellowship.requestSent')}</p>
              ) : addError ? (
                <p className="mt-4 text-sm text-red-500 break-all">{addError}</p>
              ) : null}

              <div className="mt-5 flex gap-2 w-full">
                <button
                  onClick={() => setSelectedMember(null)}
                  disabled={sending}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                >
                  {t('fellowship.cancel')}
                </button>
                <button
                  onClick={handleSendFriendRequest}
                  disabled={sending || sent}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  {sending ? '...' : sent ? t('fellowship.requestSent') : t('fellowship.addFriend')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
