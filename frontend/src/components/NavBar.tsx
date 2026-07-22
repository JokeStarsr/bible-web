'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function NavBar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const userInfoStr = localStorage.getItem('userInfo');
    if (token && userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        setIsLoggedIn(true);
        setUsername(userInfo.username || userInfo.email || '用户');
      } catch {
        setIsLoggedIn(false);
      }
    } else if (token) {
      fetchUserProfile();
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/users/me');
      const data = res.data.data;
      localStorage.setItem('userInfo', JSON.stringify(data));
      setIsLoggedIn(true);
      setUsername(data.username || data.email || '用户');
    } catch {
      setIsLoggedIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    setIsLoggedIn(false);
    setMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="border-b border-bible-warm bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-bible-gold tracking-wide">
          📖 圣经灵修
        </a>
        <nav className="flex items-center gap-4 text-sm">
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-bible-dark hover:text-bible-gold transition-colors"
              >
                <span className="w-7 h-7 rounded-full bg-bible-gold/10 text-bible-gold flex items-center justify-center text-xs font-bold">
                  {username.charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{username}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-bible-warm py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-bible-dark hover:bg-bible-warm/30 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a href="/login" className="text-bible-muted hover:text-bible-gold transition-colors">登录</a>
              <a href="/register" className="btn-primary text-sm py-2 px-4">注册</a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
