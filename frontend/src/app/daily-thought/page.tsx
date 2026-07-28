'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dailyThoughtApi } from '@/services/api';
import HebrewText from '@/components/HebrewText';
import { useI18n } from '@/i18n/I18nContext';

interface ScriptureMatch {
  reference: string;
  text: string;
  relevance: string;
}

interface DailyThoughtResult {
  pastoralResponse: string;
  scriptures: ScriptureMatch[];
  divineWord: string;
  hymn?: string;
}

export default function DailyThoughtPage() {
  const router = useRouter();
  const { t, lang } = useI18n();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DailyThoughtResult | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
        <div className="text-bible-gold text-lg animate-pulse">{t('thought.checkingAuth')}</div>
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
      const res = await dailyThoughtApi.generate(content, lang);
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('thought.generateFail'));
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
        hymn: result.hymn,
        scriptures: result.scriptures,
      });
      setSaved(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('thought.saveFail'));
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
          {t('thought.back')}
        </button>
      </div>

      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-bible-dark mb-3">{t('thought.title')}</h1>
        <p className="text-bible-muted">{t('thought.subtitle')}</p>
        <div className="mt-4">
          <button
            onClick={() => router.push('/daily-thought/history')}
            className="inline-flex items-center gap-1 text-bible-gold hover:text-amber-700 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('thought.history')}
          </button>
        </div>
      </div>

      <div className="scripture-card space-y-4">
        <label className="block text-sm font-medium text-bible-dark">
          {t('thought.label')}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('thought.placeholder')}
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-bible-gold focus:ring-1 focus:ring-bible-gold resize-none"
        />
        <div className="text-center">
          <button
            onClick={handleGenerate}
            disabled={loading || !content.trim()}
            className="exegesis-btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('thought.generating') : t('thought.generate')}
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
          <div className="scripture-card bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <h2 className="text-xl font-bold text-bible-dark mb-4">{t('thought.pastoralResponse')}</h2>
            <div className="text-bible-text leading-relaxed whitespace-pre-wrap">
              <HebrewText text={result.pastoralResponse} />
            </div>
          </div>

          {result.scriptures && result.scriptures.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-bible-dark text-center">{t('thought.scriptures')}</h2>
              {result.scriptures.map((item, index) => (
                <div key={index} className="scripture-card">
                  <div className="text-bible-gold text-sm font-semibold mb-2 tracking-wider">
                    {item.reference}
                  </div>
                  <p className="text-bible-text leading-relaxed mb-3">{item.text}</p>
                  <div className="text-sm text-bible-muted bg-bible-warm/20 rounded-lg p-3">
                    <span className="font-semibold text-bible-dark">{t('thought.relevance')}</span>
                    {item.relevance}
                  </div>
                </div>
              ))}
            </div>
          )}

          {result.divineWord && (
            <div className="scripture-card bg-gradient-to-br from-bible-gold/10 to-amber-100/50 border-bible-gold/30">
              <h2 className="text-xl font-bold text-bible-dark mb-4">{t('thought.divineWord')}</h2>
              <div className="text-lg text-bible-dark leading-relaxed font-medium whitespace-pre-wrap">
                <HebrewText text={result.divineWord} />
              </div>
            </div>
          )}

          {result.hymn && (
            <div className="scripture-card bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
              <h2 className="text-xl font-bold text-bible-dark mb-4">{t('thought.hymn')}</h2>
              <div className="text-bible-text leading-relaxed whitespace-pre-wrap">
                <HebrewText text={result.hymn} />
              </div>
            </div>
          )}

          <div className="text-center">
            {saved ? (
              <div className="inline-flex items-center gap-2 text-green-600 bg-green-50 rounded-lg px-4 py-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {t('thought.saved')}
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
                {saving ? t('thought.saving') : t('thought.save')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
