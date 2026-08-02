'use client';

import { useCallback, useEffect, useState } from 'react';
import { chatApi, type FriendInfo, type RoomMemberInfo } from '@/services/chatApi';
import { useI18n } from '@/i18n/I18nContext';
import Avatar from './Avatar';
import AddMembersModal from './AddMembersModal';

interface MembersModalProps {
  roomId: string;
  friends: FriendInfo[];
  onClose: () => void;
  /** 成员变更后通知父组件刷新群列表（成员数等） */
  onMembersChanged?: () => void;
}

export default function MembersModal({ roomId, friends, onClose, onMembersChanged }: MembersModalProps) {
  const { t } = useI18n();
  const [members, setMembers] = useState<RoomMemberInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

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
              members.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50"
                >
                  <Avatar
                    name={m.displayName || m.username}
                    avatarUrl={m.avatarUrl}
                    size={36}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {m.displayName || m.username}
                    </p>
                    <p className="text-xs text-gray-400 truncate">@{m.username}</p>
                  </div>
                </div>
              ))
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
    </>
  );
}
