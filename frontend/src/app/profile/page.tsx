'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { reflectionApi, annotationApi, bookmarkApi, scriptureApi } from '@/services/api';
import { useI18n } from '@/i18n/I18nContext';
import { localizeScriptureReference } from '@/utils/bibleBookNames';

type TabKey = 'reflections' | 'annotations' | 'bookmarks';

interface ReflectionItem {
  id: string;
  referenceText: string;
  title?: string;
  content: string;
  createdAt: string;
}

interface AnnotationItem {
  id: string;
  selectedText?: string;
  noteContent?: string;
  visibility: 'private' | 'public';
  chapterNumber: number;
  startVerse: number;
  endVerse: number;
  createdAt: string;
}

interface BookmarkItem {
  id: string;
  versionId: string;
  bookId: string;
  chapterNumber: number;
  verseNumber: number;
  createdAt: string;
}

interface ChapterVerse {
  versionId: string;
  bookId: string;
  bookName: string;
  chapterNumber: number;
  verseNumber: number;
  text: string;
}

type GroupedRecords = Record<string, ReflectionItem[]>;

export default function ProfilePage() {
  const router = useRouter();
  const { t, lang } = useI18n();

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'reflections', label: t('profile.tabs.reflections') },
    { key: 'annotations', label: t('profile.tabs.annotations') },
    { key: 'bookmarks', label: t('profile.tabs.bookmarks') },
  ];

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('reflections');

  // 响应式分页：手机端 5 条/页，PC 端 10 条/页
  const [pageSize, setPageSize] = useState(10);
  useEffect(() => {
    const detectPageSize = () => {
      setPageSize(window.innerWidth < 768 ? 5 : 10);
    };
    detectPageSize();
    window.addEventListener('resize', detectPageSize);
    return () => window.removeEventListener('resize', detectPageSize);
  }, []);

  // 灵修感悟
  const [groupedRecords, setGroupedRecords] = useState<GroupedRecords>({});
  const [dateOrder, setDateOrder] = useState<string[]>([]);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [refLoading, setRefLoading] = useState(true);
  const [refError, setRefError] = useState('');
  const [refPage, setRefPage] = useState(1);
  const [refHasMore, setRefHasMore] = useState(false);

  // 划线/默想
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [annoLoading, setAnnoLoading] = useState(false);
  const [annoError, setAnnoError] = useState('');
  const [annoPage, setAnnoPage] = useState(1);
  const [annoHasMore, setAnnoHasMore] = useState(false);

  // 收藏经文
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [bmLoading, setBmLoading] = useState(false);
  const [bmError, setBmError] = useState('');
  const [bmPage, setBmPage] = useState(1);
  const [bmHasMore, setBmHasMore] = useState(false);
  // 展开收藏经文：key = bookmark.id，value = 该书签所在章节的经文列表
  const [expandedBookmarks, setExpandedBookmarks] = useState<Record<string, ChapterVerse[]>>({});
  const [expandedBmLoading, setExpandedBmLoading] = useState<Set<string>>(new Set());
  const [expandedBmError, setExpandedBmError] = useState<Set<string>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      window.location.href = '/login';
    } else {
      setCheckingAuth(false);
      fetchReflections(1, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 页码大小变化时重新加载当前 tab 的第一页
  useEffect(() => {
    if (checkingAuth) return;
    if (activeTab === 'reflections') fetchReflections(1, pageSize);
    if (activeTab === 'annotations') fetchAnnotations(1, pageSize);
    if (activeTab === 'bookmarks') fetchBookmarks(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const fetchReflections = useCallback(async (page: number, size: number) => {
    setRefLoading(true);
    setRefError('');
    try {
      const res = await reflectionApi.list(page, size);
      const records: ReflectionItem[] = res.data.data || [];
      const grouped: GroupedRecords = {};
      const order: string[] = [];

      records.forEach((record) => {
        const date = new Date(record.createdAt).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        if (!grouped[date]) {
          grouped[date] = [];
          order.push(date);
        }
        grouped[date].push(record);
      });

      setGroupedRecords(grouped);
      setDateOrder(order);
      setRefPage(page);
      setRefHasMore(records.length >= size);
    } catch (err: any) {
      setRefError(err.response?.data?.message || t('profile.reflections.fetchError'));
    } finally {
      setRefLoading(false);
    }
  }, [lang, t]);

  const fetchAnnotations = useCallback(async (page: number, size: number) => {
    setAnnoLoading(true);
    setAnnoError('');
    try {
      const res = await annotationApi.listMy(page, size);
      setAnnotations(res.data.data || []);
      setAnnoPage(page);
      setAnnoHasMore((res.data.data || []).length >= size);
    } catch (err: any) {
      setAnnoError(err.response?.data?.message || t('profile.annotations.fetchError'));
    } finally {
      setAnnoLoading(false);
    }
  }, [t]);

  const fetchBookmarks = useCallback(async (page: number, size: number) => {
    setBmLoading(true);
    setBmError('');
    try {
      const res = await bookmarkApi.list(page, size);
      setBookmarks(res.data.data || []);
      setBmPage(page);
      setBmHasMore((res.data.data || []).length >= size);
    } catch (err: any) {
      setBmError(err.response?.data?.message || t('profile.bookmarks.fetchError'));
    } finally {
      setBmLoading(false);
    }
  }, [t]);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === 'annotations' && annotations.length === 0 && !annoLoading) {
      fetchAnnotations(1, pageSize);
    }
    if (tab === 'bookmarks' && bookmarks.length === 0 && !bmLoading) {
      fetchBookmarks(1, pageSize);
    }
  };

  // 展开收藏经文，加载整章经文
  const toggleBookmarkExpand = async (b: BookmarkItem) => {
    const key = b.id;
    if (expandedBookmarks[key]) {
      // 已展开，收起
      setExpandedBookmarks((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      return;
    }

    // 展开：加载章节经文
    setExpandedBmLoading((prev) => new Set(prev).add(key));
    setExpandedBmError((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    try {
      const res = await scriptureApi.getChapter(b.versionId, b.bookId, b.chapterNumber);
      setExpandedBookmarks((prev) => ({ ...prev, [key]: res.data.data || [] }));
    } catch (err: any) {
      setExpandedBmError((prev) => new Set(prev).add(key));
    } finally {
      setExpandedBmLoading((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString(lang === 'ko' ? 'ko-KR' : 'zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-bible-gold text-lg animate-pulse">{t('profile.auth.checking')}</div>
      </div>
    );
  }

  // 分页控件
  const Pagination = ({ page, hasMore, onPrev, onNext }: { page: number; hasMore: boolean; onPrev: () => void; onNext: () => void }) => (
    <div className="flex items-center justify-center gap-4 py-4">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="px-4 py-2 text-sm font-medium text-bible-dark bg-bible-warm/30 rounded-lg hover:bg-bible-warm/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {t('profile.prevPage')}
      </button>
      <span className="text-sm text-bible-muted">{t('profile.pageLabel', { page })}</span>
      <button
        onClick={onNext}
        disabled={!hasMore}
        className="px-4 py-2 text-sm font-medium text-bible-dark bg-bible-warm/30 rounded-lg hover:bg-bible-warm/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {t('profile.nextPage')}
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="pt-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1 text-bible-muted hover:text-bible-gold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('profile.back')}
        </button>
      </div>

      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-bible-dark mb-3">{t('profile.title')}</h1>
        <p className="text-bible-muted">{t('profile.subtitle')}</p>
      </div>

      {/* Tab 切换 */}
      <div className="flex border-b border-bible-warm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className={`px-5 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? 'border-bible-gold text-bible-gold'
                : 'border-transparent text-bible-muted hover:text-bible-dark'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ==================== 灵修感悟 ==================== */}
      {activeTab === 'reflections' && (
        <>
          {refLoading && (
            <div className="text-center text-bible-muted py-8">
              <div className="animate-pulse">{t('profile.reflections.loading')}</div>
            </div>
          )}

          {refError && (
            <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">{refError}</div>
          )}

          {!refLoading && !refError && dateOrder.length === 0 && (
            <div className="text-center text-bible-muted py-12">
              {t('profile.reflections.empty')}
            </div>
          )}

          {!refLoading &&
            dateOrder.map((date) => {
              const isExpanded = expandedDates.has(date);
              const items = groupedRecords[date];
              return (
                <div key={date} className="border border-bible-warm rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => toggleDate(date)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-bible-warm/30 hover:bg-bible-warm/50 transition-colors text-left"
                  >
                    <span className="font-bold text-bible-dark">{date}</span>
                    <span className="text-sm text-bible-muted">{items.length} {t('profile.reflections.count')}</span>
                    <svg
                      className={`w-5 h-5 text-bible-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="divide-y divide-bible-warm">
                      {items.map((record) => {
                        const itemExpanded = expandedItems.has(record.id);
                        return (
                          <div key={record.id} className="p-4">
                            <button onClick={() => toggleItem(record.id)} className="w-full text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-bible-muted">{formatTime(record.createdAt)}</span>
                                <svg
                                  className={`w-4 h-4 text-bible-muted transition-transform ${itemExpanded ? 'rotate-180' : ''}`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                              <p className="mt-2 text-bible-gold text-sm font-semibold truncate">{localizeScriptureReference(record.referenceText, lang)}</p>
                              <p className="mt-1 text-bible-text line-clamp-2">{record.title || record.content}</p>
                            </button>

                            {itemExpanded && (
                              <div className="mt-4 space-y-4">
                                <div className="scripture-card">
                                  <div className="text-center text-bible-gold text-sm font-semibold mb-4 tracking-wider">
                                    {localizeScriptureReference(record.referenceText, lang)}
                                  </div>
                                  {record.title && (
                                    <h3 className="text-lg font-bold text-bible-dark mb-3">{record.title}</h3>
                                  )}
                                  <div className="text-bible-text leading-relaxed whitespace-pre-wrap bg-bible-warm/20 rounded-lg p-4">
                                    {record.content}
                                  </div>
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

          {!refLoading && !refError && dateOrder.length > 0 && (
            <Pagination
              page={refPage}
              hasMore={refHasMore}
              onPrev={() => fetchReflections(refPage - 1, pageSize)}
              onNext={() => fetchReflections(refPage + 1, pageSize)}
            />
          )}
        </>
      )}

      {/* ==================== 划线/默想 ==================== */}
      {activeTab === 'annotations' && (
        <>
          {annoLoading && (
            <div className="text-center text-bible-muted py-8">
              <div className="animate-pulse">{t('profile.annotations.loading')}</div>
            </div>
          )}

          {annoError && (
            <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">{annoError}</div>
          )}

          {!annoLoading && !annoError && annotations.length === 0 && (
            <div className="text-center text-bible-muted py-12">
              {t('profile.annotations.empty')}
            </div>
          )}

          {!annoLoading &&
            annotations.map((a) => (
              <div key={a.id} className="scripture-card space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-bible-gold font-semibold">
                    {a.selectedText || `${a.chapterNumber}:${a.startVerse}${a.startVerse !== a.endVerse ? `-${a.endVerse}` : ''}`}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    a.visibility === 'public'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {a.visibility === 'public' ? t('profile.visibility.public') : t('profile.visibility.private')}
                  </span>
                </div>
                {a.noteContent && (
                  <div className="text-bible-text leading-relaxed whitespace-pre-wrap bg-bible-warm/20 rounded-lg p-4 text-sm">
                    {a.noteContent}
                  </div>
                )}
                <p className="text-xs text-bible-muted">{formatDate(a.createdAt)}</p>
              </div>
            ))}

          {!annoLoading && !annoError && annotations.length > 0 && (
            <Pagination
              page={annoPage}
              hasMore={annoHasMore}
              onPrev={() => fetchAnnotations(annoPage - 1, pageSize)}
              onNext={() => fetchAnnotations(annoPage + 1, pageSize)}
            />
          )}
        </>
      )}

      {/* ==================== 收藏经文 ==================== */}
      {activeTab === 'bookmarks' && (
        <>
          {bmLoading && (
            <div className="text-center text-bible-muted py-8">
              <div className="animate-pulse">{t('profile.bookmarks.loading')}</div>
            </div>
          )}

          {bmError && (
            <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">{bmError}</div>
          )}

          {!bmLoading && !bmError && bookmarks.length === 0 && (
            <div className="text-center text-bible-muted py-12">
              {t('profile.bookmarks.empty')}
            </div>
          )}

          {!bmLoading &&
            bookmarks.map((b) => {
              const verses = expandedBookmarks[b.id];
              const isLoadingVerses = expandedBmLoading.has(b.id);
              const hasError = expandedBmError.has(b.id);
              return (
                <div key={b.id} className="scripture-card">
                  <button
                    onClick={() => toggleBookmarkExpand(b)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <p className="text-bible-dark font-semibold text-sm">
                        {t('profile.bookmarks.chapterVerse').replace(/\{(\w+)\}/g, (_: string, k: string) => String(k === 'chapter' ? b.chapterNumber : b.verseNumber))}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-bible-muted">{formatDate(b.createdAt)}</span>
                      <svg
                        className={`w-4 h-4 text-bible-muted transition-transform ${verses ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* 展开后显示整章经文，高亮收藏的节 */}
                  {verses && (
                    <div className="mt-3 pt-3 border-t border-bible-warm/50 space-y-2">
                      {verses.map((v) => {
                        const isBookmarked = v.verseNumber === b.verseNumber;
                        return (
                          <p
                            key={v.verseNumber}
                            className={`leading-relaxed text-sm rounded px-1 ${
                              isBookmarked ? 'bg-amber-100 font-medium' : 'text-bible-text'
                            }`}
                          >
                            <sup className="verse-number text-bible-gold">{v.verseNumber}</sup>
                            {v.text}
                            {isBookmarked && (
                              <svg
                                className="inline-block w-3 h-3 ml-1 text-red-400"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                              </svg>
                            )}
                          </p>
                        );
                      })}
                    </div>
                  )}

                  {isLoadingVerses && (
                    <div className="mt-2 text-center text-bible-muted text-xs animate-pulse">
                      {t('profile.bookmarks.loadingVerses')}
                    </div>
                  )}

                  {hasError && (
                    <div className="mt-2 text-center text-red-500 text-xs">
                      {t('profile.bookmarks.loadVersesFail')}
                    </div>
                  )}
                </div>
              );
            })}

          {!bmLoading && !bmError && bookmarks.length > 0 && (
            <Pagination
              page={bmPage}
              hasMore={bmHasMore}
              onPrev={() => fetchBookmarks(bmPage - 1, pageSize)}
              onNext={() => fetchBookmarks(bmPage + 1, pageSize)}
            />
          )}
        </>
      )}
    </div>
  );
}
