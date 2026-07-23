'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { reflectionApi } from '@/services/api';

interface ReflectionItem {
  id: string;
  title?: string;
  referenceText: string;
  content: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupedRecords {
  [date: string]: ReflectionItem[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [groupedRecords, setGroupedRecords] = useState<GroupedRecords>({});
  const [dateOrder, setDateOrder] = useState<string[]>([]);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
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
        <p className="text-bible-muted">查看你保存的灵修记录与感悟</p>
      </div>

      {loading && (
        <div className="text-center text-bible-muted py-8">
          <div className="animate-pulse">正在加载灵修记录...</div>
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">
          {error}
        </div>
      )}

      {!loading && !error && dateOrder.length === 0 && (
        <div className="text-center text-bible-muted py-12">
          暂无灵修记录，先去首页生成经文并写下感悟吧
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
                        <p className="mt-2 text-bible-gold text-sm font-semibold truncate">
                          {record.referenceText}
                        </p>
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
    </div>
  );
}
