'use client';

import type { FriendInfo, FriendRequestInfo, RoomInfo } from '@/services/chatApi';
import { useI18n } from '@/i18n/I18nContext';
import Avatar from './Avatar';
import { formatListTime } from './timeUtils';

interface SidebarProps {
  friends: FriendInfo[];
  rooms: RoomInfo[];
  requests: FriendRequestInfo[];
  activeTab: 'friends' | 'rooms';
  selectedRoomId: string | null;
  connected: boolean;
  onTabChange: (tab: 'friends' | 'rooms') => void;
  onSelectFriend: (friend: FriendInfo) => void;
  onSelectRoom: (room: RoomInfo) => void;
  onOpenAddFriend: () => void;
  onOpenRequests: () => void;
  onOpenCreateRoom: () => void;
}

export default function Sidebar({
  friends,
  rooms,
  requests,
  activeTab,
  selectedRoomId,
  connected,
  onTabChange,
  onSelectFriend,
  onSelectRoom,
  onOpenAddFriend,
  onOpenRequests,
  onOpenCreateRoom,
}: SidebarProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col h-full bg-white border-r border-amber-100">
      {/* 顶部标题 + 连接状态 */}
      <div className="px-4 py-3 border-b border-amber-100">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-amber-800">{t('fellowship.title')}</h1>
          <span
            className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
              connected
                ? 'bg-green-50 text-green-600'
                : 'bg-amber-50 text-amber-600'
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

      {/* Tab 切换 */}
      <div className="flex border-b border-amber-100">
        <button
          onClick={() => onTabChange('friends')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors relative ${
            activeTab === 'friends'
              ? 'text-amber-600 border-b-2 border-amber-500'
              : 'text-gray-500 hover:text-amber-500'
          }`}
        >
          {t('fellowship.friends')}
          {requests.length > 0 && (
            <span className="absolute top-1.5 right-6 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
              {requests.length > 99 ? '99+' : requests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => onTabChange('rooms')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === 'rooms'
              ? 'text-amber-600 border-b-2 border-amber-500'
              : 'text-gray-500 hover:text-amber-500'
          }`}
        >
          {t('fellowship.rooms')}
        </button>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2 px-3 py-2 border-b border-amber-100 bg-amber-50/30">
        {activeTab === 'friends' ? (
          <>
            <button
              onClick={onOpenAddFriend}
              className="flex-1 text-xs py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {t('fellowship.addFriend')}
            </button>
            <button
              onClick={onOpenRequests}
              className="relative text-xs py-1.5 px-3 rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors"
            >
              {t('fellowship.requests')}
              {requests.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                  {requests.length > 99 ? '99+' : requests.length}
                </span>
              )}
            </button>
          </>
        ) : (
          <button
            onClick={onOpenCreateRoom}
            className="flex-1 text-xs py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('fellowship.createRoom')}
          </button>
        )}
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'friends' ? (
          friends.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-12 px-4">
              {t('fellowship.noFriends')}
            </div>
          ) : (
            friends.map((f) => {
              const active = selectedRoomId === f.roomId;
              return (
                <button
                  key={f.friendId}
                  onClick={() => onSelectFriend(f)}
                  className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors border-b border-gray-50 ${
                    active ? 'bg-amber-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <Avatar name={f.displayName || f.username} avatarUrl={f.avatarUrl} size={40} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${active ? 'text-amber-800' : 'text-gray-800'}`}>
                        {f.displayName || f.username}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {formatListTime(f.lastMessageAt, t)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {f.lastMessageContent || ''}
                    </p>
                  </div>
                  {f.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center flex-shrink-0">
                      {f.unreadCount > 99 ? '99+' : f.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          )
        ) : rooms.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-12 px-4">
            {t('fellowship.noRooms')}
          </div>
        ) : (
          rooms.map((r) => {
            const active = selectedRoomId === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onSelectRoom(r)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors border-b border-gray-50 ${
                  active ? 'bg-amber-50' : 'hover:bg-gray-50'
                }`}
              >
                <Avatar name={r.name} avatarUrl={r.avatarUrl} size={40} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-medium truncate ${active ? 'text-amber-800' : 'text-gray-800'}`}>
                      {r.name}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatListTime(r.lastMessageAt, t)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {r.lastMessageSenderName ? `${r.lastMessageSenderName}: ` : ''}
                    {r.lastMessageContent || ''}
                  </p>
                </div>
                {r.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center flex-shrink-0">
                    {r.unreadCount > 99 ? '99+' : r.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
