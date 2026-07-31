'use client';

import { useState } from 'react';
import type { FriendRequestInfo } from '@/services/chatApi';
import { useI18n } from '@/i18n/I18nContext';
import Avatar from './Avatar';
import { formatListTime } from './timeUtils';

interface FriendRequestsModalProps {
  requests: FriendRequestInfo[];
  onClose: () => void;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
}

export default function FriendRequestsModal({
  requests,
  onClose,
  onAccept,
  onReject,
}: FriendRequestsModalProps) {
  const { t } = useI18n();
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleAccept = async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    try {
      await onAccept(id);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (busyId) return;
    setBusyId(id);
    try {
      await onReject(id);
    } finally {
      setBusyId(null);
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
          <h2 className="text-base font-bold text-amber-800">{t('fellowship.requests')}</h2>
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

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto">
          {requests.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-12">
              {t('fellowship.requests')}
            </div>
          ) : (
            requests.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 px-4 py-3 border-b border-gray-50"
              >
                <Avatar
                  name={r.fromUsername}
                  avatarUrl={r.fromAvatarUrl}
                  size={36}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {r.fromUsername}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatListTime(r.createdAt, t)}
                    </span>
                  </div>
                  {r.message && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.message}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleAccept(r.id)}
                      disabled={busyId === r.id}
                      className="text-xs px-3 py-1 rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                    >
                      {busyId === r.id ? '...' : t('fellowship.accept')}
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      disabled={busyId === r.id}
                      className="text-xs px-3 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      {t('fellowship.reject')}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
