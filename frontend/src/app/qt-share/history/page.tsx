'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useI18n } from '@/i18n/I18nContext';

interface HistoryItem {
  qtContentId: string;
  responseId: string | null;
  qtDate: string;
  title: string;
  scriptureReference: string;
  responded: boolean;
  meditation: string | null;
  application: string | null;
  prayer: string | null;
}

interface PageData {
  items: HistoryItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function QtHistoryPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      window.location.href = '/login';
      return;
    }
    setCheckingAuth(false);
    loadHistory(1);
  }, []);

  const loadHistory = async (p: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/qt/history?page=${p}&size=10`);
      setData(res.data.data);
      setPage(p);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
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

      {loading && (
        <div className="text-center py-12">
          <div className="text-bible-gold text-lg animate-pulse">{t('qtHistory.loading')}</div>
        </div>
      )}

      {!loading && data && (
        <>
          {data.items.length === 0 ? (
            <div className="scripture-card text-center py-12">
              <p className="text-bible-muted">{t('qtHistory.noRecords')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.items.map((item) => (
                <div key={item.qtContentId} className="scripture-card">
                  <button
                    onClick={() => setExpanded(expanded === item.qtContentId ? null : item.qtContentId)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-bible-muted">{item.qtDate}</span>
                        <h3 className="text-lg font-semibold text-bible-dark mt-1">{item.title}</h3>
                        {item.scriptureReference && (
                          <p className="text-sm text-bible-gold mt-1">{item.scriptureReference}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.responded ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{t('qtHistory.responded')}</span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{t('qtHistory.notResponded')}</span>
                        )}
                        <svg
                          className={`w-4 h-4 text-bible-muted transition-transform ${expanded === item.qtContentId ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </button>

                  {expanded === item.qtContentId && (
                    <div className="mt-4 pt-4 border-t border-bible-warm/50 space-y-3">
                      {item.responded ? (
                        <>
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
                        </>
                      ) : (
                        <p className="text-sm text-bible-muted">{t('qtHistory.notResponded')}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 分页 */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => loadHistory(page - 1)}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm rounded border border-bible-warm text-bible-dark hover:bg-bible-warm/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => loadHistory(p)}
                  className={`px-3 py-1.5 text-sm rounded border ${
                    p === page
                      ? 'bg-bible-gold text-white border-bible-gold'
                      : 'border-bible-warm text-bible-dark hover:bg-bible-warm/20'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => loadHistory(page + 1)}
                disabled={page >= data.totalPages}
                className="px-3 py-1.5 text-sm rounded border border-bible-warm text-bible-dark hover:bg-bible-warm/20 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
