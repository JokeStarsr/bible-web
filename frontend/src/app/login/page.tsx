'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export default function LoginPage() {
  const router = useRouter();
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
      localStorage.setItem('token', res.data.data.accessToken);
      localStorage.setItem('refreshToken', res.data.data.refreshToken);
      if (res.data.data.userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(res.data.data.userInfo));
      }
      router.push('/');
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold text-center text-bible-dark mb-8">登录</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm text-bible-muted mb-1">邮箱</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-bible-muted mb-1">密码</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
      <p className="text-center mt-4 text-sm text-bible-muted">
        还没有账号？<a href="/register" className="text-bible-gold hover:underline">立即注册</a>
      </p>
    </div>
  );
}