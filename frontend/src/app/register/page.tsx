'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function RegisterPage() {
  const router = useRouter();
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
      // 开发环境或邮件服务未配置时，后端会直接返回验证码，自动填入
      if (res.data?.data) {
        setForm(prev => ({ ...prev, verificationCode: res.data.data }));
        setInfo(res.data?.message || '验证码已自动填入，请查看上方输入框');
      } else {
        setInfo('验证码已发送至您的邮箱，请注意查收');
      }
      setCodeSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || '发送验证码失败');
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
      setError(err.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold text-center text-bible-dark mb-8">注册</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm text-bible-muted mb-1">用户名</label>
          <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">邮箱</label>
          <div className="flex gap-2">
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="flex-1" />
            <button type="button" onClick={sendCode} className="btn-secondary whitespace-nowrap text-sm">
              {codeSent ? '已发送' : '获取验证码'}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">验证码</label>
          <input type="text" value={form.verificationCode} onChange={e => setForm({ ...form, verificationCode: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">密码</label>
          <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">确认密码</label>
          <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
        </div>
        {info && <div className="text-amber-600 text-sm">{info}</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? '注册中...' : '注册'}
        </button>
      </form>
      <p className="text-center mt-4 text-sm text-bible-muted">
        已有账号？<a href="/login" className="text-bible-gold hover:underline">立即登录</a>
      </p>
    </div>
  );
}