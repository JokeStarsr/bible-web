'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/I18nContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '', verificationCode: '' });
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    try {
      setError('');
      setInfo('');
      const res = await axios.post(`${API_BASE}/auth/send-register-code`, { email: form.email });
      if (res.data?.data) {
        setForm(prev => ({ ...prev, verificationCode: res.data.data }));
        setInfo(res.data?.message || t('register.codeAutoFilled'));
      } else {
        setInfo(t('register.codeSentMsg'));
      }
      setCodeSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('register.sendCodeFail'));
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/auth/register`, form);
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || t('register.registerFail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold text-center text-bible-dark mb-8">{t('register.title')}</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('register.username')}</label>
          <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('register.email')}</label>
          <div className="flex gap-2">
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="flex-1" />
            <button type="button" onClick={sendCode} className="btn-secondary whitespace-nowrap text-sm">
              {codeSent ? t('register.codeSent') : t('register.getCode')}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('register.verificationCode')}</label>
          <input type="text" value={form.verificationCode} onChange={e => setForm({ ...form, verificationCode: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('register.password')}</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('register.confirmPassword')}</label>
          <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
        </div>
        {info && <div className="text-amber-600 text-sm">{info}</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? t('register.submitting') : t('register.submit')}
        </button>
      </form>
      <p className="text-center mt-4 text-sm text-bible-muted">
        {t('register.hasAccount')}<a href="/login" className="text-bible-gold hover:underline">{t('register.loginNow')}</a>
      </p>
    </div>
  );
}
