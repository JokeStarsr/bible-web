'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { dailyThoughtApi } from '@/services/api';
import HebrewText from '@/components/HebrewText';
import { useI18n } from '@/i18n/I18nContext';

interface ScriptureMatch {
  reference: string;
  text: string;
  relevance: string;
}

interface HistoryItem {
  id: string;
  content: string;
  pastoralResponse: string;
  scriptures: ScriptureMatch[];
  divineWord: string;
  hymn?: string;
  createdAt: string;
}

interface GroupedRecords {
  [date: string]: HistoryItem[];
}

export default function DailyThoughtHistoryPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [checkingAuth, setCheckingAuth] = useState(true);

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

  const [groupedRecords, setGroupedRecords] = useState<GroupedRecords>({});
  const [dateOrder, setDateOrder] = useState<string[]>([]);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      window.location.href = '/login';
    } else {
      setCheckingAuth(false);
      fetchHistory(1, pageSize);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 页码大小变化时重新加载第一页
  useEffect(() => {
    if (checkingAuth) return;
    fetchHistory(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);

  const fetchHistory = useCallback(async (p: number, size: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await dailyThoughtApi.history(p, size);
      const records: HistoryItem[] = res.data.data || [];
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
      setPage(p);
      setHasMore(records.length >= size);
    } catch (err: any) {
      setError(err.response?.data?.message || t('thoughtHistory.loadFail'));
    } finally {
      setLoading(false);
    }
  }, [lang, t]);

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-bible-gold text-lg animate-pulse">{t('thoughtHistory.checkingAuth')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="pt-4 flex items-center justify-between">
        <button
          onClick={() => router.push('/daily-thought')}
          className="inline-flex items-center gap-1 text-bible-muted hover:text-bible-gold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('thoughtHistory.back')}
        </button>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-bible-muted hover:text-bible-gold transition-colors"
        >
          {t('thoughtHistory.home')}
        </button>
      </div>

      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-bible-dark mb-3">{t('thoughtHistory.title')}</h1>
        <p className="text-bible-muted">{t('thoughtHistory.subtitle')}</p>
      </div>

      {loading && (
        <div className="text-center text-bible-muted py-8">
          <div className="animate-pulse">{t('thoughtHistory.loading')}</div>
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">
          {error}
        </div>
      )}

      {!loading && !error && dateOrder.length === 0 && (
        <div className="text-center text-bible-muted py-12">
          {t('thoughtHistory.empty')}
        </div>
      )}

      {!loading && dateOrder.map((date) => {
        const isExpanded = expandedDates.has(date);
        const items = groupedRecords[date];
        return (
          <div key={date} className="border border-bible-warm rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => toggleDate(date)}
              className="w-full flex items-center justify-between px-4 py-3 bg-bible-warm/30 hover:bg-bible-warm/50 transition-colors text-left"
            >
              <span className="font-bold text-bible-dark">{date}</span>
              <span className="text-sm text-bible-muted">{items.length}{' '}{t('thoughtHistory.title')}</span>
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
                      <button
                        onClick={() => toggleItem(record.id)}
                        className="w-full text-left"
                      >
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
                        <p className="mt-2 text-bible-text line-clamp-2">{record.content}</p>
                      </button>

                      {itemExpanded && (
                        <div className="mt-4 space-y-4">
                          <div className="scripture-card">
                            <h2 className="text-lg font-bold text-bible-dark mb-2">{t('thoughtHistory.title')}</h2>
                            <div className="text-bible-text leading-relaxed whitespace-pre-wrap bg-bible-warm/20 rounded-lg p-4">
                              <HebrewText text={record.content} />
                            </div>
                          </div>

                          <div className="scripture-card bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
                            <h2 className="text-xl font-bold text-bible-dark mb-4">{t('thoughtHistory.pastoralResponse')}</h2>
                            <div className="text-bible-text leading-relaxed whitespace-pre-wrap">
                              <HebrewText text={record.pastoralResponse} />
                            </div>
                          </div>

                          {record.scriptures && record.scriptures.length > 0 && (
                            <div className="space-y-4">
                              <h2 className="text-xl font-bold text-bible-dark text-center">{t('thoughtHistory.scriptures')}</h2>
                              {record.scriptures.map((item, index) => (
                                <div key={index} className="scripture-card">
                                  <div className="text-bible-gold text-sm font-semibold mb-2 tracking-wider">
                                    {item.reference}
                                  </div>
                                  <p className="text-bible-text leading-relaxed mb-3">{item.text}</p>
                                  <div className="text-sm text-bible-muted bg-bible-warm/20 rounded-lg p-3">
                                    <span className="font-semibold text-bible-dark">{t('thoughtHistory.relevance')}</span>
                                    {item.relevance}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {record.divineWord && (
                            <div className="scripture-card bg-gradient-to-br from-bible-gold/10 to-amber-100/50 border-bible-gold/30">
                              <h2 className="text-xl font-bold text-bible-dark mb-4">{t('thoughtHistory.divineWord')}</h2>
                              <div className="text-lg text-bible-dark leading-relaxed font-medium whitespace-pre-wrap">
                                <HebrewText text={record.divineWord} />
                              </div>
                            </div>
                          )}

                          {record.hymn && (
                            <div className="scripture-card bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
                              <h2 className="text-xl font-bold text-bible-dark mb-4">{t('thoughtHistory.hymn')}</h2>
                              <div className="text-bible-text leading-relaxed whitespace-pre-wrap">
                                <HebrewText text={record.hymn} />
                              </div>
                            </div>
                          )}
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

      {!loading && !error && dateOrder.length > 0 && (
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            onClick={() => fetchHistory(page - 1, pageSize)}
            disabled={page <= 1}
            className="px-4 py-2 text-sm font-medium text-bible-dark bg-bible-warm/30 rounded-lg hover:bg-bible-warm/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t('profile.prevPage')}
          </button>
          <span className="text-sm text-bible-muted">{t('profile.pageLabel', { page })}</span>
          <button
            onClick={() => fetchHistory(page + 1, pageSize)}
            disabled={!hasMore}
            className="px-4 py-2 text-sm font-medium text-bible-dark bg-bible-warm/30 rounded-lg hover:bg-bible-warm/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t('profile.nextPage')}
          </button>
        </div>
      )}
    </div>
  );
}
