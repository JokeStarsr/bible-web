'use client';

import { useState } from 'react';
import axios from 'axios';
import { useI18n } from '@/i18n/I18nContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const token = res.data.data.accessToken;
      const refreshToken = res.data.data.refreshToken;
      const maxAge = 30 * 60;
      document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      document.cookie = `refreshToken=${encodeURIComponent(refreshToken)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      if (res.data.data.userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(res.data.data.userInfo));
      }
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || t('login.fail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold text-center text-bible-dark mb-8">{t('login.title')}</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('login.email')}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('login.password')}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="flex justify-end">
          <a href="/forgot-password" className="text-sm text-bible-gold hover:underline">
            {t('login.forgotPassword')}
          </a>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? t('login.submitting') : t('login.submit')}
        </button>
      </form>
      <p className="text-center mt-4 text-sm text-bible-muted">
        {t('login.noAccount')}<a href="/register" className="text-bible-gold hover:underline">{t('login.registerNow')}</a>
      </p>
    </div>
  );
}
