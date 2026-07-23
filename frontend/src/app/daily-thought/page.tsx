'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dailyThoughtApi } from '@/services/api';

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
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    setSaved(false);
    try {
      const res = await dailyThoughtApi.generate(content);
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || '生成失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    setError('');
    try {
      await dailyThoughtApi.save({
        content: content.trim(),
        pastoralResponse: result.pastoralResponse,
        divineWord: result.divineWord,
        scriptures: result.scriptures,
      });
      setSaved(true);
    } catch (err: any) {
      setError(err.response?.data?.message || '保存失败，请稍后再试');
    } finally {
      setSaving(false);
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
        <div className="mt-4">
          <button
            onClick={() => router.push('/daily-thought/history')}
            className="inline-flex items-center gap-1 text-bible-gold hover:text-amber-700 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            历史记录
          </button>
        </div>
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

          {/* 保存到历史记录 */}
          <div className="text-center">
            {saved ? (
              <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-4 py-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已保存到历史记录
              </div>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                {saving ? '保存中...' : '保存到历史记录'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
