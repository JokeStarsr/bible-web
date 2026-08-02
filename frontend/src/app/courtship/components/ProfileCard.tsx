'use client';

import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { courtshipApi, type CourtshipProfile } from '@/services/courtshipApi';
import Avatar from '@/app/fellowship/components/Avatar';

interface Props {
  profile: CourtshipProfile;
  hasMyProfile: boolean;
  onLikeChanged: (userId: string, liked: boolean) => void;
  onMatched: () => void;
}

export default function ProfileCard({ profile, hasMyProfile, onLikeChanged, onMatched }: Props) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [showLikeForm, setShowLikeForm] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [matchResult, setMatchResult] = useState<boolean | null>(null);

  const photos = profile.photos ? profile.photos.split(',').filter(Boolean) : [];
  const genderLabel =
    profile.gender === 'MALE' ? t('courtship.male') : t('courtship.female');
  const ageText = profile.age && profile.age > 0 ? `${profile.age} ${t('courtship.yearsOld')}` : '';

  const handleLike = async () => {
    if (!hasMyProfile) {
      setError(t('courtship.createProfileFirst'));
      return;
    }
    setSending(true);
    setError('');
    try {
      const match = await courtshipApi.like({
        toUserId: profile.userId,
        message: message.trim() || undefined,
      });
      onLikeChanged(profile.userId, true);
      if (match) {
        setMatchResult(true);
        onMatched();
      } else {
        setMatchResult(false);
      }
      setShowLikeForm(false);
      setMessage('');
    } catch (err: any) {
      setError(err.response?.data?.message || t('courtship.loadFailed'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-pink-100 overflow-hidden flex flex-col">
      {/* 顶部：头像 + 基本信息 */}
      <div className="p-4 flex items-start gap-3">
        <Avatar name={profile.nickname} avatarUrl={profile.avatarUrl} size={56} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-bible-dark truncate">{profile.nickname}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-pink-50 text-pink-700">
              {genderLabel}
            </span>
            {ageText && <span className="text-xs text-bible-muted">{ageText}</span>}
          </div>
          {profile.region && (
            <p className="text-xs text-bible-muted mt-0.5">📍 {profile.region}</p>
          )}
          {profile.occupation && (
            <p className="text-xs text-bible-muted mt-0.5">💼 {profile.occupation}</p>
          )}
        </div>
      </div>

      {/* 照片（展开时显示） */}
      {expanded && photos.length > 0 && (
        <div className="px-4 pb-2 grid grid-cols-3 gap-1.5">
          {photos.map((url, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg overflow-hidden bg-pink-50"
            >
              <img
                src={url}
                alt={`${profile.nickname}-${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 详细信息（展开时显示） */}
      {expanded && (
        <div className="px-4 py-2 space-y-1 text-sm text-bible-dark">
          {profile.beliefYears != null && profile.beliefYears > 0 && (
            <p>
              <span className="text-bible-muted">{t('courtship.beliefYears')}：</span>
              {profile.beliefYears}
            </p>
          )}
          {profile.churchName && (
            <p>
              <span className="text-bible-muted">{t('courtship.church')}：</span>
              {profile.churchName}
            </p>
          )}
          {profile.ministryRole && (
            <p>
              <span className="text-bible-muted">{t('courtship.ministry')}：</span>
              {profile.ministryRole}
            </p>
          )}
          {profile.bio && (
            <p className="pt-1">
              <span className="text-bible-muted">{t('courtship.bio')}：</span>
              <span className="whitespace-pre-wrap">{profile.bio}</span>
            </p>
          )}
        </div>
      )}

      {/* 心动表单（展开时显示） */}
      {showLikeForm && !matchResult && (
        <div className="px-4 py-3 border-t border-pink-100 bg-pink-50/50 space-y-2">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('courtship.likeMessagePlaceholder')}
            rows={2}
            className="w-full text-sm px-3 py-2 border border-pink-200 rounded-lg bg-white focus:outline-none focus:border-pink-500 resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowLikeForm(false)}
              className="text-sm px-3 py-1.5 rounded-lg text-bible-muted hover:bg-pink-100 transition-colors"
            >
              {t('profile.account.cancel')}
            </button>
            <button
              onClick={handleLike}
              disabled={sending}
              className="text-sm px-4 py-1.5 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors disabled:opacity-50"
            >
              {sending ? '...' : t('courtship.like')}
            </button>
          </div>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="px-4 py-1 text-xs text-red-600">{error}</div>
      )}

      {/* 匹配成功提示 */}
      {matchResult === true && (
        <div className="mx-4 mb-3 mt-1 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700 text-center">
          <p className="font-bold">{t('courtship.matchSuccess')}</p>
          <p className="text-xs mt-0.5">{t('courtship.matchSuccessDesc')}</p>
        </div>
      )}
      {matchResult === false && (
        <div className="mx-4 mb-3 mt-1 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700 text-center">
          {t('courtship.likeSent')}
        </div>
      )}

      {/* 底部操作 */}
      <div className="mt-auto px-4 py-3 border-t border-pink-100 flex items-center justify-between bg-white">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-bible-muted hover:text-pink-700 transition-colors"
        >
          {expanded ? `▲ ${t('courtship.collapse')}` : `▼ ${t('courtship.viewDetails')}`}
        </button>
        {profile.likedByMe || matchResult !== null ? (
          <span className="text-xs px-3 py-1.5 rounded-full bg-pink-100 text-pink-700 font-medium">
            {matchResult === true ? t('courtship.matched') : t('courtship.liked')}
          </span>
        ) : (
          <button
            onClick={() => {
              if (!hasMyProfile) {
                setError(t('courtship.createProfileFirst'));
                return;
              }
              setError('');
              setShowLikeForm(true);
            }}
            className="text-sm px-4 py-1.5 rounded-full bg-pink-500 text-white hover:bg-pink-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {t('courtship.like')}
          </button>
        )}
      </div>
    </div>
  );
}
