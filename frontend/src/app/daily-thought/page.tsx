'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface ScriptureMatch {
  reference: string;
  text: string;
  relevance: string;
}

interface DailyThoughtResult {
  pastoralResponse: string;
  scriptures: ScriptureMatch[];
  divineWord: string;
}

export default function DailyThoughtPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DailyThoughtResult | null>(null);
  const [error, setError] = useState('');

  // 客户端登录保护：未登录则清除可能残留的 Cookie 并跳转到登录页
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      document.cookie = 'token=; path=/; max-age=0';
      document.cookie = 'refreshToken=; path=/; max-age=0';
      window.location.href = '/login';
    } else {
      setCheckingAuth(false);
    }
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-bible-gold text-lg animate-pulse">正在确认登录状态...</div>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/daily-thought/generate', { content: content.trim() });
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '生成失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="pt-4">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1 text-bible-muted hover:text-bible-gold transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回主页面
        </button>
      </div>

      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-bible-dark mb-3">今日随想</h1>
        <p className="text-bible-muted">写下今天的感悟、挣扎或感恩，让神的话语回应你的心</p>
      </div>

      <div className="scripture-card space-y-4">
        <label className="block text-sm font-medium text-bible-dark">
          今日随想
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="今天发生了什么？你有什么感受、困惑、感恩或祷告..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-bible-gold focus:ring-1 focus:ring-bible-gold resize-none"
        />
        <div className="text-center">
          <button
            onClick={handleGenerate}
            disabled={loading || !content.trim()}
            className="exegesis-btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '神的话语正在预备中...' : '神可能想对你说：'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-center text-red-500 bg-red-50 rounded-lg py-3 px-4">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* 牧养回应 */}
          <div className="scripture-card bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <h2 className="text-xl font-bold text-bible-dark mb-4">牧养回应</h2>
            <div className="text-bible-text leading-relaxed whitespace-pre-wrap">
              {result.pastoralResponse}
            </div>
          </div>

          {/* 推荐经文 */}
          {result.scriptures && result.scriptures.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-bible-dark text-center">相关经文</h2>
              {result.scriptures.map((item, index) => (
                <div key={index} className="scripture-card">
                  <div className="text-bible-gold text-sm font-semibold mb-2 tracking-wider">
                    {item.reference}
                  </div>
                  <p className="text-bible-text leading-relaxed mb-3">{item.text}</p>
                  <div className="text-sm text-bible-muted bg-bible-warm/20 rounded-lg p-3">
                    <span className="font-semibold text-bible-dark">关联：</span>
                    {item.relevance}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 神可能想对你说 */}
          {result.divineWord && (
            <div className="scripture-card bg-gradient-to-br from-bible-gold/10 to-amber-100/50 border-bible-gold/30">
              <h2 className="text-xl font-bold text-bible-dark mb-4">✨ 神可能想对你说</h2>
              <div className="text-lg text-bible-dark leading-relaxed font-medium whitespace-pre-wrap">
                {result.divineWord}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
