'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reflectionApi, annotationApi, bookmarkApi } from '@/services/api';

interface ReflectionItem {
  id: string;
  title?: string;
  referenceText: string;
  content: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnotationItem {
  id: string;
  userId: string;
  versionId: string;
  bookId: string;
  chapterNumber: number;
  startVerse: number;
  endVerse: number;
  selectedText?: string;
  noteContent?: string;
  visibility: string;
  createdAt: string;
}

interface BookmarkItem {
  id: string;
  bookId: string;
  chapterNumber: number;
  verseNumber: number;
  createdAt: string;
}

interface GroupedRecords {
  [date: string]: ReflectionItem[];
}

type TabKey = 'reflections' | 'annotations' | 'bookmarks';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'reflections', label: '灵修感悟' },
  { key: 'annotations', label: '划线/默想' },
  { key: 'bookmarks', label: '收藏经文' },
];

export default function ProfilePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('reflections');

  // 灵修感悟
  const [groupedRecords, setGroupedRecords] = useState<GroupedRecords>({});
  const [dateOrder, setDateOrder] = useState<string[]>([]);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 划线/默想
  const [annotations, setAnnotations] = useState<AnnotationItem[]>([]);
  const [annoLoading, setAnnoLoading] = useState(false);
  const [annoError, setAnnoError] = useState('');

  // 收藏经文
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [bmLoading, setBmLoading] = useState(false);
  const [bmError, setBmError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      window.location.href = '/login';
    } else {
      setCheckingAuth(false);
      fetchReflections();
    }
  }, []);

  const fetchReflections = async () => {
    try {
      const res = await reflectionApi.list(1, 200);
      const records: ReflectionItem[] = res.data.data || [];
      const grouped: GroupedRecords = {};
      const order: string[] = [];

      records.forEach((record) => {
        const date = new Date(record.createdAt).toLocaleDateString('zh-CN', {
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
    } catch (err: any) {
      setError(err.response?.data?.message || '获取灵修记录失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnnotations = async () => {
    setAnnoLoading(true);
    setAnnoError('');
    try {
      const res = await annotationApi.listMy(1, 200);
      setAnnotations(res.data.data || []);
    } catch (err: any) {
      setAnnoError(err.response?.data?.message || '获取标注失败');
    } finally {
      setAnnoLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    setBmLoading(true);
    setBmError('');
    try {
      const res = await bookmarkApi.list(1, 200);
      setBookmarks(res.data.data || []);
    } catch (err: any) {
      setBmError(err.response?.data?.message || '获取收藏失败');
    } finally {
      setBmLoading(false);
    }
  };

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    if (tab === 'annotations' && annotations.length === 0 && !annoLoading) {
      fetchAnnotations();
    }
    if (tab === 'bookmarks' && bookmarks.length === 0 && !bmLoading) {
      fetchBookmarks();
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
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-bible-gold text-lg animate-pulse">正在确认登录状态...</div>
      </div>
    );
  }

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
          返回首页
        </button>
      </div>

      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-bible-dark mb-3">个人中心</h1>
        <p className="text-bible-muted">查看你的灵修记录、划线默想与收藏</p>
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
          {loading && (
            <div className="text-center text-bible-muted py-8">
              <div className="animate-pulse">正在加载灵修记录...</div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">{error}</div>
          )}

          {!loading && !error && dateOrder.length === 0 && (
            <div className="text-center text-bible-muted py-12">
              暂无灵修记录，先去首页生成经文并写下感悟吧
            </div>
          )}

          {!loading &&
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
                    <span className="text-sm text-bible-muted">{items.length} 条感悟</span>
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
                              <p className="mt-2 text-bible-gold text-sm font-semibold truncate">{record.referenceText}</p>
                              <p className="mt-1 text-bible-text line-clamp-2">{record.title || record.content}</p>
                            </button>

                            {itemExpanded && (
                              <div className="mt-4 space-y-4">
                                <div className="scripture-card">
                                  <div className="text-center text-bible-gold text-sm font-semibold mb-4 tracking-wider">
                                    {record.referenceText}
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
        </>
      )}

      {/* ==================== 划线/默想 ==================== */}
      {activeTab === 'annotations' && (
        <>
          {annoLoading && (
            <div className="text-center text-bible-muted py-8">
              <div className="animate-pulse">正在加载划线默想...</div>
            </div>
          )}

          {annoError && (
            <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">{annoError}</div>
          )}

          {!annoLoading && !annoError && annotations.length === 0 && (
            <div className="text-center text-bible-muted py-12">
              暂无划线默想，去首页生成经文后划选经文写下你的默想吧
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
                    {a.visibility === 'public' ? '公开' : '仅自己可见'}
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
        </>
      )}

      {/* ==================== 收藏经文 ==================== */}
      {activeTab === 'bookmarks' && (
        <>
          {bmLoading && (
            <div className="text-center text-bible-muted py-8">
              <div className="animate-pulse">正在加载收藏...</div>
            </div>
          )}

          {bmError && (
            <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">{bmError}</div>
          )}

          {!bmLoading && !bmError && bookmarks.length === 0 && (
            <div className="text-center text-bible-muted py-12">
              暂无收藏经文，去首页生成经文后点击收藏吧
            </div>
          )}

          {!bmLoading &&
            bookmarks.map((b) => (
              <div key={b.id} className="scripture-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <p className="text-bible-dark font-semibold text-sm">
                    第{b.chapterNumber}章 第{b.verseNumber}节
                  </p>
                </div>
                <span className="text-xs text-bible-muted">{formatDate(b.createdAt)}</span>
              </div>
            ))}
        </>
      )}
    </div>
  );
}
