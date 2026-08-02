'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/i18n/I18nContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [form, setForm] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const sendCode = async () => {
    setError('');
    setInfo('');
    try {
      const res = await axios.post(`${API_BASE}/auth/send-reset-code`, { email: form.email });
      // dev 环境邮件未配置时，后端会直接返回验证码（data 非空）
      if (res.data?.data) {
        setForm((prev) => ({ ...prev, verificationCode: res.data.data }));
        setInfo(res.data?.message || t('forgot.codeAutoFilled'));
      } else {
        setInfo(t('forgot.codeSentMsg'));
      }
      setCodeSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('forgot.sendCodeFail'));
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.newPassword !== form.confirmPassword) {
      setError(t('profile.account.passwordRule'));
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.newPassword)) {
      setError(t('forgot.passwordRule'));
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/reset-password`, {
        email: form.email,
        verificationCode: form.verificationCode,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('forgot.resetFail'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-bible-dark mb-2">{t('forgot.resetSuccess')}</h1>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="btn-primary w-full"
        >
          {t('forgot.backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold text-center text-bible-dark mb-2">{t('forgot.title')}</h1>
      <p className="text-center text-bible-muted text-sm mb-6">{t('forgot.subtitle')}</p>
      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('forgot.email')}</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="flex-1"
            />
            <button
              type="button"
              onClick={sendCode}
              disabled={!form.email}
              className="btn-secondary whitespace-nowrap text-sm disabled:opacity-50"
            >
              {codeSent ? t('forgot.codeSent') : t('forgot.getCode')}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('forgot.verificationCode')}</label>
          <input
            type="text"
            value={form.verificationCode}
            onChange={(e) => setForm({ ...form, verificationCode: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('forgot.newPassword')}</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            required
          />
          <p className="text-xs text-bible-muted mt-1">{t('forgot.passwordRule')}</p>
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">{t('forgot.confirmPassword')}</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            required
          />
        </div>
        {info && <div className="text-amber-600 text-sm">{info}</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? t('forgot.submitting') : t('forgot.submit')}
        </button>
      </form>
      <p className="text-center mt-4 text-sm text-bible-muted">
        <a href="/login" className="text-bible-gold hover:underline">{t('forgot.backToLogin')}</a>
      </p>
    </div>
  );
}
