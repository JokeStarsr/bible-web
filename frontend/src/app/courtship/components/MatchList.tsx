'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/I18nContext';
import { courtshipApi, type MatchResponse, type LikeResponse } from '@/services/courtshipApi';
import Avatar from '@/app/fellowship/components/Avatar';

interface Props {
  myProfileId?: string;
  onDissolved: () => void;
}

export default function MatchList({ myProfileId, onDissolved }: Props) {
  const router = useRouter();
  const { t } = useI18n();

  const [tab, setTab] = useState<'matches' | 'likes'>('matches');
  const [matches, setMatches] = useState<MatchResponse[]>([]);
  const [likes, setLikes] = useState<LikeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [matchList, likeList] = await Promise.all([
        courtshipApi.myMatches(),
        courtshipApi.myLikes(),
      ]);
      setMatches(matchList || []);
      setLikes(likeList || []);
    } catch (err: any) {
      setError(err.response?.data?.message || t('courtship.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDissolve = async (matchId: string) => {
    if (!confirm(t('courtship.confirmDissolve'))) return;
    setError('');
    try {
      await courtshipApi.dissolveMatch(matchId);
      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      onDissolved();
    } catch (err: any) {
      setError(err.response?.data?.message || t('courtship.loadFailed'));
    }
  };

  const handleStartChat = (otherUserId: string) => {
    // 跳转到主内通讯，对方已自动成为好友
    router.push('/fellowship');
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-bible-muted animate-pulse">
        {t('home.generatingScripture')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-600 text-sm bg-red-50 rounded-lg py-2 px-3">{error}</div>
      )}

      {/* 子 Tab */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('matches')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'matches'
              ? 'bg-pink-500 text-white'
              : 'bg-white text-bible-muted hover:bg-pink-50 border border-pink-100'
          }`}
        >
          {t('courtship.myMatches')} ({matches.length})
        </button>
        <button
          onClick={() => setTab('likes')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'likes'
              ? 'bg-pink-500 text-white'
              : 'bg-white text-bible-muted hover:bg-pink-50 border border-pink-100'
          }`}
        >
          {t('courtship.myLikes')} ({likes.length})
        </button>
      </div>

      {/* 匹配列表 */}
      {tab === 'matches' && (
        <>
          {matches.length === 0 ? (
            <div className="text-center py-12 text-bible-muted">
              <svg
                className="w-16 h-16 mx-auto mb-3 text-pink-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <p className="text-sm">{t('courtship.noMatches')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-xl shadow-sm border border-pink-100 p-3 flex items-center gap-3"
                >
                  <Avatar name={m.otherNickname} avatarUrl={m.otherAvatarUrl} size={48} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-bible-dark truncate">{m.otherNickname}</p>
                    <p className="text-xs text-bible-muted">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartChat(m.otherUserId)}
                      className="text-sm px-3 py-1.5 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      {t('courtship.startChat')}
                    </button>
                    <button
                      onClick={() => handleDissolve(m.id)}
                      className="text-xs px-2 py-1.5 rounded-full text-bible-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label={t('courtship.dissolveMatch')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 心动列表（已表达，未匹配） */}
      {tab === 'likes' && (
        <>
          {likes.length === 0 ? (
            <div className="text-center py-12 text-bible-muted">
              <svg
                className="w-16 h-16 mx-auto mb-3 text-pink-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <p className="text-sm">{t('courtship.noLikes')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {likes.map((l) => (
                <div
                  key={l.id}
                  className="bg-white rounded-xl shadow-sm border border-pink-100 p-3 flex items-center gap-3"
                >
                  <Avatar name={l.toNickname} avatarUrl={l.toAvatarUrl} size={48} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-bible-dark truncate">{l.toNickname}</p>
                    {l.message && (
                      <p className="text-xs text-bible-muted truncate">💬 {l.message}</p>
                    )}
                    <p className="text-xs text-bible-muted">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      l.matched
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {l.matched ? t('courtship.matched') : t('courtship.liked')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
