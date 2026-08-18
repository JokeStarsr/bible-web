'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useI18n } from '@/i18n/I18nContext';
import { localizeScriptureReference, localizeBibleBookNames } from '@/utils/bibleBookNames';

type Visibility = 'PUBLIC' | 'PRIVATE';

interface ResponseItem {
  responseId: string;
  userId: string;
  username: string;
  displayName: string;
  qtContentId: string;
  qtDate: string;
  title: string;
  scriptureReference: string;
  titleKo?: string;
  scriptureReferenceKo?: string;
  meditation: string;
  application: string;
  prayer: string;
  photos: string[];
  visibility?: string;
  createdAt: string;
}

interface UserGroup {
  userId: string;
  username: string;
  displayName: string;
  responses: ResponseItem[];
}

/**
 * 自适应高度的 textarea：随内容增多自动变长，不出现内部滚动条。
 */
function useAutoResizeTextarea<T extends HTMLTextAreaElement>(value: string) {
  const ref = useRef<T | null>(null);
  const resize = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 80)}px`;
    el.style.overflowY = 'hidden';
  }, []);
  useEffect(() => { resize(); }, [value, resize]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, [resize]);
  useEffect(() => { resize(); }, [resize]);
  return ref;
}

export default function QtHistoryPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [error, setError] = useState('');

  // 展开状态：第一层用户分组，第二层具体回应
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);

  // 编辑状态（仅自己的回应可编辑）
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMeditation, setEditMeditation] = useState('');
  const [editApplication, setEditApplication] = useState('');
  const [editPrayer, setEditPrayer] = useState('');
  const [editVisibility, setEditVisibility] = useState<Visibility>('PUBLIC');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 编辑模式下的自适应 textarea refs
  const editMeditationRef = useAutoResizeTextarea<HTMLTextAreaElement>(editMeditation);
  const editApplicationRef = useAutoResizeTextarea<HTMLTextAreaElement>(editApplication);
  const editPrayerRef = useAutoResizeTextarea<HTMLTextAreaElement>(editPrayer);

  // 视图模式：按用户名分类 / 按时间排序
  const [viewMode, setViewMode] = useState<'user' | 'time'>('user');
  // 按时间视图的分页（默认5条/页）
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      window.location.href = '/login';
      return;
    }
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      setCurrentUserId(userInfo.id || '');
    } catch {
      // ignore
    }
    setCheckingAuth(false);
    loadAllResponses();
  }, []);

  const loadAllResponses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/qt/all-responses');
      setResponses(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || t('qtHistory.loadFail'));
    } finally {
      setLoading(false);
    }
  };

  // 按用户名分组
  const userGroups: UserGroup[] = useMemo(() => {
    const defaultUser = t('qtHistory.defaultUser');
    const map = new Map<string, UserGroup>();
    for (const r of responses) {
      if (!map.has(r.userId)) {
        map.set(r.userId, {
          userId: r.userId,
          username: r.username || defaultUser,
          displayName: r.displayName || r.username || defaultUser,
          responses: [],
        });
      }
      map.get(r.userId)!.responses.push(r);
    }
    // 每个用户组内按日期倒序（API 已按 created_at 倒序，这里保持）
    return Array.from(map.values());
  }, [responses, t]);

  // 按时间视图：以灵修日期为维度分组，当天优先，分页（默认5个日期/页）
  interface DateGroup {
    qtDate: string;
    title: string;
    scriptureReference: string;
    titleKo?: string;
    scriptureReferenceKo?: string;
    responses: ResponseItem[];
  }
  const dateGroups: DateGroup[] = useMemo(() => {
    const map = new Map<string, DateGroup>();
    for (const r of responses) {
      if (!map.has(r.qtDate)) {
        map.set(r.qtDate, {
          qtDate: r.qtDate,
          title: r.title || '',
          scriptureReference: r.scriptureReference || '',
          titleKo: r.titleKo,
          scriptureReferenceKo: r.scriptureReferenceKo,
          responses: [],
        });
      }
      map.get(r.qtDate)!.responses.push(r);
    }
    // 按 qtDate 倒序（当天自然排第一）
    return Array.from(map.values()).sort((a, b) => (a.qtDate < b.qtDate ? 1 : -1));
  }, [responses]);

  // 分页：按"日期分组"分页，每页 PAGE_SIZE 个日期
  const totalPages = Math.max(1, Math.ceil(dateGroups.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pagedDateGroups = dateGroups.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  // 按时间视图：第一层展开的是日期
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const toggleDate = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date);
    setExpandedResponse(null);
    setEditingId(null);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    setExpandedDate(null);
    setExpandedResponse(null);
    setEditingId(null);
  };

  const toggleUser = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
    setExpandedResponse(null);
    setEditingId(null);
  };

  const toggleResponse = (responseId: string) => {
    setExpandedResponse(expandedResponse === responseId ? null : responseId);
    setEditingId(null);
  };

  const startEdit = (item: ResponseItem) => {
    setEditingId(item.responseId);
    setEditMeditation(item.meditation || '');
    setEditApplication(item.application || '');
    setEditPrayer(item.prayer || '');
    setEditVisibility(item.visibility === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC');
    setExpandedResponse(item.responseId);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (item: ResponseItem) => {
    setSaving(true);
    try {
      await api.post('/qt/response', {
        qtContentId: item.qtContentId,
        meditation: editMeditation,
        application: editApplication,
        prayer: editPrayer,
        photos: item.photos || [],
        visibility: editVisibility,
      });
      setEditingId(null);
      await loadAllResponses();
    } catch (err: any) {
      setError(err.response?.data?.message || t('qtHistory.saveFail'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ResponseItem) => {
    if (!window.confirm(t('qtHistory.deleteConfirm', { date: item.qtDate }))) return;
    setDeletingId(item.responseId);
    try {
      await api.delete(`/qt/response/by-id/${item.responseId}`);
      await loadAllResponses();
    } catch (err: any) {
      setError(err.response?.data?.message || t('qtHistory.deleteFail'));
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString(lang === 'ko' ? 'ko-KR' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-bible-gold text-lg animate-pulse">{t('qtHistory.checkingAuth')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div className="pt-4">
        <button
          onClick={() => router.push('/qt-share')}
          className="inline-flex items-center gap-1 text-bible-muted hover:text-bible-gold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('qtHistory.back')}
        </button>
      </div>

      <div className="text-center py-4">
        <h1 className="text-3xl font-bold text-bible-dark mb-2">{t('qtHistory.title')}</h1>
        <p className="text-bible-muted">{t('qtHistory.subtitle')}</p>
      </div>

      {/* 视图切换 Tab */}
      {!loading && responses.length > 0 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setViewMode('user')}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'user'
                ? 'bg-bible-gold text-white'
                : 'bg-bible-warm/40 text-bible-dark hover:bg-bible-warm/60'
            }`}
          >
            {t('qtHistory.byUser')}
          </button>
          <button
            onClick={() => { setViewMode('time'); setCurrentPage(1); setExpandedResponse(null); setEditingId(null); }}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              viewMode === 'time'
                ? 'bg-bible-gold text-white'
                : 'bg-bible-warm/40 text-bible-dark hover:bg-bible-warm/60'
            }`}
          >
            {t('qtHistory.byTime')}
          </button>
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">{error}</div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="text-bible-gold text-lg animate-pulse">{t('qtHistory.loading')}</div>
        </div>
      )}

      {!loading && responses.length === 0 && (
        <div className="scripture-card text-center py-12">
          <p className="text-bible-muted">{t('qtHistory.noRecords')}</p>
        </div>
      )}

      {/* 按用户名分类视图 */}
      {!loading && responses.length > 0 && viewMode === 'user' && (
        <div className="space-y-4">
          {/* 第一层：按用户名分类 */}
          {userGroups.map((group) => {
            const isExpanded = expandedUser === group.userId;
            const isMe = group.userId === currentUserId;
            return (
              <div key={group.userId} className="scripture-card overflow-hidden">
                <button
                  onClick={() => toggleUser(group.userId)}
                  className="w-full flex items-center justify-between px-4 py-4 bg-bible-warm/30 hover:bg-bible-warm/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isMe ? 'bg-bible-gold' : 'bg-bible-muted'}`}>
                      {group.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-bible-dark">{group.displayName}</span>
                        {isMe && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{t('qtHistory.me')}</span>
                        )}
                      </div>
                      <span className="text-sm text-bible-muted">{group.responses.length} {t('qtHistory.responsesCount')}</span>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-bible-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 第二层：该用户的回应列表 */}
                {isExpanded && (
                  <div className="divide-y divide-bible-warm/50">
                    {group.responses.map((item) => {
                      const respExpanded = expandedResponse === item.responseId;
                      const isEditing = editingId === item.responseId;
                      const canManage = item.userId === currentUserId;
                      return (
                        <div key={item.responseId} className="p-4">
                          <button
                            onClick={() => toggleResponse(item.responseId)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm text-bible-muted">{formatDate(item.qtDate)}</span>
                                  {item.visibility === 'PRIVATE' && canManage && (
                                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{t('qt.privateTag')}</span>
                                  )}
                                </div>
                                <h3 className="text-base font-semibold text-bible-dark mt-1">{lang === 'ko' && item.titleKo ? item.titleKo : localizeBibleBookNames(item.title, lang)}</h3>
                                {item.scriptureReference && (
                                  <p className="text-sm text-bible-gold mt-0.5">{lang === 'ko' && item.scriptureReferenceKo ? item.scriptureReferenceKo : localizeScriptureReference(item.scriptureReference, lang)}</p>
                                )}
                              </div>
                              <svg
                                className={`w-4 h-4 text-bible-muted transition-transform ${respExpanded ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {/* 第三层：具体回应内容 */}
                          {respExpanded && !isEditing && (
                            <div className="mt-4 pt-4 border-t border-bible-warm/50 space-y-3">
                              {item.meditation && (
                                <div>
                                  <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.meditation')}</p>
                                  <p className="text-sm text-bible-dark whitespace-pre-wrap">{item.meditation}</p>
                                </div>
                              )}
                              {item.application && (
                                <div>
                                  <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.application')}</p>
                                  <p className="text-sm text-bible-dark whitespace-pre-wrap">{item.application}</p>
                                </div>
                              )}
                              {item.prayer && (
                                <div>
                                  <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.prayer')}</p>
                                  <p className="text-sm text-bible-dark whitespace-pre-wrap">{item.prayer}</p>
                                </div>
                              )}
                              {item.photos && item.photos.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.photo')}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {item.photos.map((p, i) => (
                                      <img key={i} src={p} alt={`${t('qtHistory.photo')}${i + 1}`} className="w-20 h-20 object-cover rounded" />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 仅自己的回应显示修改/删除按钮 */}
                              {canManage && (
                                <div className="flex gap-2 pt-2">
                                  <button
                                    onClick={() => startEdit(item)}
                                    className="px-3 py-1.5 text-sm bg-bible-gold text-white rounded hover:bg-amber-600 transition-colors"
                                  >
                                    {t('qtHistory.edit')}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item)}
                                    disabled={deletingId === item.responseId}
                                    className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                  >
                                    {deletingId === item.responseId ? t('qtHistory.deleting') : t('qtHistory.delete')}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 编辑模式 */}
                          {respExpanded && isEditing && (
                            <div className="mt-4 pt-4 border-t border-bible-warm/50 space-y-3">
                              <div>
                                <label className="text-xs font-medium text-bible-gold mb-1 block">{t('qtHistory.meditation')}</label>
                                <textarea
                                  ref={editMeditationRef}
                                  value={editMeditation}
                                  onChange={(e) => setEditMeditation(e.target.value)}
                                  rows={3}
                                  className="w-full text-sm border border-bible-warm rounded-lg p-2 focus:outline-none focus:border-bible-gold resize-none overflow-hidden leading-relaxed"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-bible-gold mb-1 block">{t('qtHistory.application')}</label>
                                <textarea
                                  ref={editApplicationRef}
                                  value={editApplication}
                                  onChange={(e) => setEditApplication(e.target.value)}
                                  rows={3}
                                  className="w-full text-sm border border-bible-warm rounded-lg p-2 focus:outline-none focus:border-bible-gold resize-none overflow-hidden leading-relaxed"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-bible-gold mb-1 block">{t('qtHistory.prayer')}</label>
                                <textarea
                                  ref={editPrayerRef}
                                  value={editPrayer}
                                  onChange={(e) => setEditPrayer(e.target.value)}
                                  rows={3}
                                  className="w-full text-sm border border-bible-warm rounded-lg p-2 focus:outline-none focus:border-bible-gold resize-none overflow-hidden leading-relaxed"
                                />
                              </div>
                              {/* 可见范围选择 */}
                              <div className="bg-amber-50/40 rounded-lg border border-amber-100 p-2.5">
                                <label className="block text-xs font-semibold text-amber-800 mb-1.5">{t('qt.visibilityLabel')}</label>
                                <div className="flex flex-wrap gap-2 mb-1">
                                  <button type="button" onClick={() => setEditVisibility('PUBLIC')}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                                      editVisibility === 'PUBLIC'
                                        ? 'bg-amber-500 text-white border-amber-500'
                                        : 'bg-white text-amber-700 border-amber-200 hover:border-amber-400'
                                    }`}>
                                    {t('qt.visibilityPublic')}
                                  </button>
                                  <button type="button" onClick={() => setEditVisibility('PRIVATE')}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                                      editVisibility === 'PRIVATE'
                                        ? 'bg-gray-600 text-white border-gray-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                    }`}>
                                    {t('qt.visibilityPrivate')}
                                  </button>
                                </div>
                                <p className="text-[11px] text-amber-600/80 leading-relaxed">{t('qt.visibilityHint')}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(item)}
                                  disabled={saving}
                                  className="px-4 py-1.5 text-sm bg-bible-gold text-white rounded hover:bg-amber-600 transition-colors disabled:opacity-50"
                                >
                                  {saving ? t('qtHistory.saving') : t('qtHistory.save')}
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-4 py-1.5 text-sm border border-bible-warm text-bible-dark rounded hover:bg-bible-warm/30 transition-colors"
                                >
                                  {t('qtHistory.cancel')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 按时间视图：以灵修日期为维度分组，点开日期展示该日所有人的回应 */}
      {!loading && responses.length > 0 && viewMode === 'time' && (
        <div className="space-y-4">
          {pagedDateGroups.map((group) => {
            const isExpanded = expandedDate === group.qtDate;
            const today = new Date();
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const isToday = group.qtDate === todayStr;
            return (
              <div key={group.qtDate} className={`scripture-card overflow-hidden ${isToday ? 'ring-1 ring-bible-gold/40' : ''}`}>
                {/* 第一层：灵修日期 + 标题 */}
                <button
                  onClick={() => toggleDate(group.qtDate)}
                  className="w-full flex items-center justify-between px-4 py-4 bg-bible-warm/30 hover:bg-bible-warm/50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-bible-dark">{formatDate(group.qtDate)}</span>
                      {isToday && (
                        <span className="text-xs bg-bible-gold text-white px-2 py-0.5 rounded-full">{t('qtHistory.today')}</span>
                      )}
                      <span className="text-xs text-bible-muted bg-gray-100 px-2 py-0.5 rounded-full">
                        {group.responses.length} {t('qtHistory.peopleCount')}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-bible-dark mt-1">{lang === 'ko' && group.titleKo ? group.titleKo : localizeBibleBookNames(group.title, lang)}</h3>
                    {group.scriptureReference && (
                      <p className="text-sm text-bible-gold mt-0.5">{lang === 'ko' && group.scriptureReferenceKo ? group.scriptureReferenceKo : localizeScriptureReference(group.scriptureReference, lang)}</p>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-bible-muted transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* 第二层：该日期下所有人的回应 */}
                {isExpanded && (
                  <div className="divide-y divide-bible-warm/50">
                    {group.responses.map((item) => {
                      const respExpanded = expandedResponse === item.responseId;
                      const isEditing = editingId === item.responseId;
                      const canManage = item.userId === currentUserId;
                      const isMe = item.userId === currentUserId;
                      return (
                        <div key={item.responseId} className="p-4">
                          <button
                            onClick={() => toggleResponse(item.responseId)}
                            className="w-full text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${isMe ? 'bg-bible-gold' : 'bg-bible-muted'}`}>
                                    {(item.displayName || item.username || t('qtHistory.defaultUser')).charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-bible-dark text-sm">{item.displayName || item.username || t('qtHistory.defaultUser')}</span>
                                      {isMe && (
                                        <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">{t('qtHistory.me')}</span>
                                      )}
                                      {item.visibility === 'PRIVATE' && isMe && (
                                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{t('qt.privateTag')}</span>
                                      )}
                                    </div>
                                    <span className="text-xs text-bible-muted">{formatDateTime(item.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                              <svg
                                className={`w-4 h-4 text-bible-muted transition-transform flex-shrink-0 ${respExpanded ? 'rotate-180' : ''}`}
                                fill="none" stroke="currentColor" viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>

                          {/* 第三层：具体回应内容 */}
                          {respExpanded && !isEditing && (
                            <div className="mt-3 pt-3 border-t border-bible-warm/50 space-y-3">
                              {item.meditation && (
                                <div>
                                  <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.meditation')}</p>
                                  <p className="text-sm text-bible-dark whitespace-pre-wrap">{item.meditation}</p>
                                </div>
                              )}
                              {item.application && (
                                <div>
                                  <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.application')}</p>
                                  <p className="text-sm text-bible-dark whitespace-pre-wrap">{item.application}</p>
                                </div>
                              )}
                              {item.prayer && (
                                <div>
                                  <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.prayer')}</p>
                                  <p className="text-sm text-bible-dark whitespace-pre-wrap">{item.prayer}</p>
                                </div>
                              )}
                              {item.photos && item.photos.length > 0 && (
                                <div>
                                  <p className="text-xs font-medium text-bible-gold mb-1">{t('qtHistory.photo')}</p>
                                  <div className="flex flex-wrap gap-2">
                                    {item.photos.map((p, i) => (
                                      <img key={i} src={p} alt={`${t('qtHistory.photo')}${i + 1}`} className="w-20 h-20 object-cover rounded" />
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 仅自己的回应显示修改/删除按钮 */}
                              {canManage && (
                                <div className="flex gap-2 pt-2">
                                  <button
                                    onClick={() => startEdit(item)}
                                    className="px-3 py-1.5 text-sm bg-bible-gold text-white rounded hover:bg-amber-600 transition-colors"
                                  >
                                    {t('qtHistory.edit')}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item)}
                                    disabled={deletingId === item.responseId}
                                    className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                                  >
                                    {deletingId === item.responseId ? t('qtHistory.deleting') : t('qtHistory.delete')}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* 编辑模式 */}
                          {respExpanded && isEditing && (
                            <div className="mt-3 pt-3 border-t border-bible-warm/50 space-y-3">
                              <div>
                                <label className="text-xs font-medium text-bible-gold mb-1 block">{t('qtHistory.meditation')}</label>
                                <textarea
                                  ref={editMeditationRef}
                                  value={editMeditation}
                                  onChange={(e) => setEditMeditation(e.target.value)}
                                  rows={3}
                                  className="w-full text-sm border border-bible-warm rounded-lg p-2 focus:outline-none focus:border-bible-gold resize-none overflow-hidden leading-relaxed"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-bible-gold mb-1 block">{t('qtHistory.application')}</label>
                                <textarea
                                  ref={editApplicationRef}
                                  value={editApplication}
                                  onChange={(e) => setEditApplication(e.target.value)}
                                  rows={3}
                                  className="w-full text-sm border border-bible-warm rounded-lg p-2 focus:outline-none focus:border-bible-gold resize-none overflow-hidden leading-relaxed"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-bible-gold mb-1 block">{t('qtHistory.prayer')}</label>
                                <textarea
                                  ref={editPrayerRef}
                                  value={editPrayer}
                                  onChange={(e) => setEditPrayer(e.target.value)}
                                  rows={3}
                                  className="w-full text-sm border border-bible-warm rounded-lg p-2 focus:outline-none focus:border-bible-gold resize-none overflow-hidden leading-relaxed"
                                />
                              </div>
                              {/* 可见范围选择 */}
                              <div className="bg-amber-50/40 rounded-lg border border-amber-100 p-2.5">
                                <label className="block text-xs font-semibold text-amber-800 mb-1.5">{t('qt.visibilityLabel')}</label>
                                <div className="flex flex-wrap gap-2 mb-1">
                                  <button type="button" onClick={() => setEditVisibility('PUBLIC')}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                                      editVisibility === 'PUBLIC'
                                        ? 'bg-amber-500 text-white border-amber-500'
                                        : 'bg-white text-amber-700 border-amber-200 hover:border-amber-400'
                                    }`}>
                                    {t('qt.visibilityPublic')}
                                  </button>
                                  <button type="button" onClick={() => setEditVisibility('PRIVATE')}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                                      editVisibility === 'PRIVATE'
                                        ? 'bg-gray-600 text-white border-gray-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                                    }`}>
                                    {t('qt.visibilityPrivate')}
                                  </button>
                                </div>
                                <p className="text-[11px] text-amber-600/80 leading-relaxed">{t('qt.visibilityHint')}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(item)}
                                  disabled={saving}
                                  className="px-4 py-1.5 text-sm bg-bible-gold text-white rounded hover:bg-amber-600 transition-colors disabled:opacity-50"
                                >
                                  {saving ? t('qtHistory.saving') : t('qtHistory.save')}
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="px-4 py-1.5 text-sm border border-bible-warm text-bible-dark rounded hover:bg-bible-warm/30 transition-colors"
                                >
                                  {t('qtHistory.cancel')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* 分页控件（按日期分组分页） */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => goToPage(safePage - 1)}
                disabled={safePage <= 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-bible-warm text-bible-dark hover:bg-bible-warm/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('qtHistory.prevPage')}
              </button>
              <span className="text-sm text-bible-muted px-2">
                {t('qtHistory.pageInfo', { cur: safePage, total: totalPages, count: dateGroups.length })}
              </span>
              <button
                onClick={() => goToPage(safePage + 1)}
                disabled={safePage >= totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-bible-warm text-bible-dark hover:bg-bible-warm/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('qtHistory.nextPage')}
              </button>
            </div>
          )}
          {totalPages === 1 && dateGroups.length > 0 && (
            <div className="text-center text-xs text-bible-muted">{t('qtHistory.totalDates', { count: dateGroups.length })}</div>
          )}
        </div>
      )}
    </div>
  );
}
