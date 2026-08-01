'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import {
  courtshipApi,
  type WitnessResponse,
  type PageResult,
} from '@/services/courtshipApi';
import Avatar from '@/app/fellowship/components/Avatar';

export default function WitnessPanel() {
  const { t } = useI18n();

  const [tab, setTab] = useState<'list' | 'mine' | 'submit'>('list');
  const [list, setList] = useState<WitnessResponse[]>([]);
  const [mine, setMine] = useState<WitnessResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 提交表单
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result: PageResult<WitnessResponse> = await courtshipApi.listWitnesses(1, 20);
      setList(result.items || []);
    } catch (err: any) {
      setError(err.response?.data?.message || t('courtship.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadMine = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await courtshipApi.myWitnesses();
      setMine(result || []);
    } catch (err: any) {
      setError(err.response?.data?.message || t('courtship.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (tab === 'list') loadList();
    else if (tab === 'mine') loadMine();
  }, [tab, loadList, loadMine]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await courtshipApi.submitWitness({ title: title.trim(), content: content.trim() });
      setSuccess(t('courtship.witnessSubmitted'));
      setTitle('');
      setContent('');
      // 刷新“我的见证”
      setTimeout(() => {
        setTab('mine');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || t('courtship.loadFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (status?: string) => {
    if (!status) return null;
    const map: Record<string, string> = {
      PENDING: 'bg-amber-50 text-amber-700',
      APPROVED: 'bg-green-50 text-green-700',
      REJECTED: 'bg-red-50 text-red-700',
    };
    const label =
      status === 'PENDING'
        ? t('courtship.witnessPending')
        : status === 'APPROVED'
        ? t('courtship.witnessApproved')
        : t('courtship.statusRejected');
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* 子 Tab */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('list')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'list'
              ? 'bg-pink-500 text-white'
              : 'bg-white text-bible-muted hover:bg-pink-50 border border-pink-100'
          }`}
        >
          {t('courtship.witness')}
        </button>
        <button
          onClick={() => setTab('mine')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'mine'
              ? 'bg-pink-500 text-white'
              : 'bg-white text-bible-muted hover:bg-pink-50 border border-pink-100'
          }`}
        >
          {t('courtship.myWitnesses')}
        </button>
        <button
          onClick={() => setTab('submit')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'submit'
              ? 'bg-pink-500 text-white'
              : 'bg-white text-bible-muted hover:bg-pink-50 border border-pink-100'
          }`}
        >
          {t('courtship.submitWitness')}
        </button>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 rounded-lg py-2 px-3">{error}</div>
      )}
      {success && (
        <div className="text-green-700 text-sm bg-green-50 rounded-lg py-2 px-3">{success}</div>
      )}

      {/* 见证列表 */}
      {tab === 'list' && (
        <>
          {loading ? (
            <div className="text-center py-12 text-bible-muted animate-pulse">
              {t('home.generatingScripture')}
            </div>
          ) : list.length === 0 ? (
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="text-sm">{t('courtship.noWitnesses')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {list.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-xl shadow-sm border border-pink-100 p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Avatar name={w.nickname || '用户'} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-bible-dark truncate">
                        {w.nickname}
                      </p>
                      <p className="text-xs text-bible-muted">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-bible-dark">{w.title}</h3>
                  <p className="text-sm text-bible-dark whitespace-pre-wrap leading-relaxed">
                    {w.content}
                  </p>
                  {w.photoUrl && (
                    <div className="rounded-lg overflow-hidden">
                      <img
                        src={w.photoUrl}
                        alt={w.title}
                        className="max-h-80 w-auto"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 我的见证 */}
      {tab === 'mine' && (
        <>
          {loading ? (
            <div className="text-center py-12 text-bible-muted animate-pulse">
              {t('home.generatingScripture')}
            </div>
          ) : mine.length === 0 ? (
            <div className="text-center py-12 text-bible-muted">
              <p className="text-sm">{t('courtship.noMyWitnesses')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mine.map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-xl shadow-sm border border-pink-100 p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-bible-dark">{w.title}</h3>
                    {statusBadge(w.status)}
                  </div>
                  <p className="text-sm text-bible-dark whitespace-pre-wrap leading-relaxed">
                    {w.content}
                  </p>
                  <p className="text-xs text-bible-muted">
                    {new Date(w.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 提交见证 */}
      {tab === 'submit' && (
        <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-4 sm:p-6 space-y-3">
          <div>
            <label className="block text-sm text-bible-muted mb-1">
              {t('courtship.witnessTitle')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
              placeholder={t('courtship.witnessTitle')}
            />
          </div>
          <div>
            <label className="block text-sm text-bible-muted mb-1">
              {t('courtship.witnessContent')} <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 resize-none"
              placeholder={t('courtship.witnessContent')}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim() || !content.trim()}
              className="px-6 py-2 rounded-lg bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors disabled:opacity-50"
            >
              {submitting ? '...' : t('courtship.submitWitness')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
