'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/I18nContext';
import { courtshipApi, type CourtshipProfile } from '@/services/courtshipApi';
import ProfileEditor from './components/ProfileEditor';
import ProfileCard from './components/ProfileCard';
import MatchList from './components/MatchList';
import WitnessPanel from './components/WitnessPanel';

type Tab = 'browse' | 'profile' | 'matches' | 'witness';

export default function CourtshipPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('browse');

  // 我的资料（用于判断是否已创建、是否可表达心动）
  const [myProfile, setMyProfile] = useState<CourtshipProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // 浏览列表
  const [profiles, setProfiles] = useState<CourtshipProfile[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(false);
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterRegion, setFilterRegion] = useState<string>('');

  const pageSize = 12;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      window.location.href = '/login';
      return;
    }
    setCheckingAuth(false);
    loadMyProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMyProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const data = await courtshipApi.getMyProfile();
      setMyProfile(data);
    } catch {
      /* ignore */
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const loadProfiles = useCallback(
    async (resetPage = false) => {
      setLoadingList(true);
      const targetPage = resetPage ? 1 : page;
      try {
        const result = await courtshipApi.listProfiles({
          gender: filterGender || undefined,
          region: filterRegion || undefined,
          page: targetPage,
          size: pageSize,
        });
        if (resetPage) {
          setProfiles(result.items || []);
          setPage(1);
        } else {
          setProfiles((prev) => [...prev, ...(result.items || [])]);
        }
        setTotal(result.total || 0);
      } catch {
        /* ignore */
      } finally {
        setLoadingList(false);
      }
    },
    [page, filterGender, filterRegion]
  );

  useEffect(() => {
    if (!checkingAuth) {
      loadProfiles(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkingAuth, filterGender]);

  const handleProfileSaved = async (saved: CourtshipProfile) => {
    setMyProfile(saved);
    setActiveTab('browse');
    loadProfiles(true);
  };

  const handleLikeChanged = (userId: string, liked: boolean) => {
    setProfiles((prev) =>
      prev.map((p) => (p.userId === userId ? { ...p, likedByMe: liked } : p))
    );
  };

  const handleMatched = () => {
    // 匹配成功后刷新我的资料（保持 likedByMe 等状态一致）以及切换到匹配页
    loadMyProfile();
    setActiveTab('matches');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF8F0]">
        <div className="text-pink-700 text-lg animate-pulse">{t('home.checkingAuth')}</div>
      </div>
    );
  }

  // 是否已通过审核可被他人看到
  const profileApproved = myProfile?.status === 'APPROVED';
  const hasProfile = !!myProfile;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'browse', label: t('courtship.browse') },
    { key: 'profile', label: t('courtship.myProfile') },
    { key: 'matches', label: t('courtship.myMatches') },
    { key: 'witness', label: t('courtship.witness') },
  ];

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-1 text-sm text-pink-700 hover:text-pink-900 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">{t('profile.back')}</span>
          </button>
          <h1 className="text-lg font-bold text-bible-dark">{t('courtship.title')}</h1>
          <div className="w-12" />
        </div>

        {/* 副标题 */}
        <p className="text-center text-bible-muted text-sm mb-4">{t('courtship.subtitle')}</p>

        {/* 资料状态提示 */}
        {hasProfile && !profileApproved && myProfile?.status !== 'HIDDEN' && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg text-sm text-center ${
              myProfile?.status === 'REJECTED'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {myProfile?.status === 'REJECTED'
              ? `${t('courtship.profileRejectedTip')}${
                  myProfile.rejectReason ? '：' + myProfile.rejectReason : ''
                }`
              : t('courtship.profilePendingTip')}
          </div>
        )}

        {/* Tab 切换 */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4 bg-white rounded-xl p-1 shadow-sm border border-pink-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-[80px] py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-pink-100 text-pink-800'
                  : 'text-bible-muted hover:bg-pink-50 hover:text-pink-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区 */}
        {activeTab === 'browse' && (
          <div className="space-y-4">
            {/* 筛选栏 */}
            <div className="bg-white rounded-xl p-3 shadow-sm border border-pink-100 flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-1 text-sm text-bible-muted">
                <span>{t('courtship.filter')}:</span>
              </div>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="text-sm px-3 py-1.5 rounded-lg border border-pink-200 bg-white focus:outline-none focus:border-pink-500"
              >
                <option value="">{t('courtship.allGender')}</option>
                <option value="MALE">{t('courtship.male')}</option>
                <option value="FEMALE">{t('courtship.female')}</option>
              </select>
              <input
                type="text"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                placeholder={t('courtship.regionPlaceholder')}
                className="text-sm px-3 py-1.5 rounded-lg border border-pink-200 bg-white focus:outline-none focus:border-pink-500 flex-1 min-w-[120px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') loadProfiles(true);
                }}
              />
              <button
                onClick={() => loadProfiles(true)}
                className="text-sm px-4 py-1.5 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors"
              >
                {t('courtship.search')}
              </button>
            </div>

            {/* 资料卡片网格 */}
            {loadingList && profiles.length === 0 ? (
              <div className="text-center py-12 text-bible-muted animate-pulse">
                {t('home.generatingScripture')}
              </div>
            ) : profiles.length === 0 ? (
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-sm">{t('courtship.noProfiles')}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {profiles.map((p) => (
                    <ProfileCard
                      key={p.userId}
                      profile={p}
                      hasMyProfile={hasProfile}
                      onLikeChanged={handleLikeChanged}
                      onMatched={handleMatched}
                    />
                  ))}
                </div>
                {/* 加载更多 */}
                {profiles.length < total && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => {
                        setPage((p) => p + 1);
                        loadProfiles(false);
                      }}
                      disabled={loadingList}
                      className="text-sm px-6 py-2 rounded-full bg-white border border-pink-200 text-pink-700 hover:bg-pink-50 transition-colors disabled:opacity-50"
                    >
                      {loadingList ? '...' : t('courtship.loadMore')}
                    </button>
                  </div>
                )}
                {profiles.length >= total && total > 0 && (
                  <div className="text-center text-xs text-bible-muted pt-2">
                    {t('courtship.noMoreProfiles')}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <ProfileEditor
            myProfile={myProfile}
            loading={profileLoading}
            onSaved={handleProfileSaved}
          />
        )}

        {activeTab === 'matches' && (
          <MatchList myProfileId={myProfile?.userId} onDissolved={() => {}} />
        )}

        {activeTab === 'witness' && <WitnessPanel />}
      </div>
    </div>
  );
}
