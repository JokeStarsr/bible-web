'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { useI18n } from '@/i18n/I18nContext';

export default function NavBar() {
  const router = useRouter();
  const { t, lang, swapLang } = useI18n();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        setUsername(userInfo.username || userInfo.email || t('nav.user'));
        checkAdminRole();
      } catch {
        setIsLoggedIn(false);
      }
    } else if (token) {
      fetchUserProfile();
    }
  };

  const checkAdminRole = async () => {
    try {
      const res = await api.get('/qt/admin/check');
      setIsAdmin(res.data.data === true);
    } catch {
      setIsAdmin(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/users/me');
      const data = res.data.data;
      localStorage.setItem('userInfo', JSON.stringify(data));
      setIsLoggedIn(true);
      setUsername(data.username || data.email || t('nav.user'));
      checkAdminRole();
    } catch {
      setIsLoggedIn(false);
    }
  };

  const clearAuthCookies = () => {
    if (typeof window === 'undefined') return;
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'refreshToken=; path=/; max-age=0';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    clearAuthCookies();
    setIsLoggedIn(false);
    setMenuOpen(false);
    setMobileMenuOpen(false);
    router.push('/login');
  };

  return (
    <header className="border-b border-bible-warm bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-bible-gold tracking-wide">
          {t('nav.logo')}
        </a>

        {/* 桌面导航 */}
        <nav className="hidden sm:flex items-center gap-4 text-sm">
          {/* 语言切换 */}
          <button
            onClick={swapLang}
            className="text-xs px-2 py-1 rounded border border-bible-warm text-bible-muted hover:text-bible-gold hover:border-bible-gold transition-colors"
          >
            {lang === 'zh' ? '한글' : '中文'}
          </button>

          {isLoggedIn ? (
            <>
              <a href="/messages" className="text-bible-muted hover:text-bible-gold transition-colors">
{t('nav.messages')}
              </a>
              <a href="/fellowship" className="text-bible-muted hover:text-bible-gold transition-colors">
                {t('nav.fellowship')}
              </a>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 text-bible-dark hover:text-bible-gold transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-bible-gold/10 text-bible-gold flex items-center justify-center text-xs font-bold">
                    {username.charAt(0).toUpperCase()}
                  </span>
                  <span>{username}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-bible-warm py-1 z-50">
                    <a
                      href="/profile"
                      className="block w-full text-left px-4 py-2 text-sm text-bible-dark hover:bg-bible-warm/30 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
{t('nav.profile')}
                    </a>
                    {isAdmin && (
                      <a
                        href="/qt-admin"
                        className="block w-full text-left px-4 py-2 text-sm text-amber-700 font-medium hover:bg-amber-50 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t('nav.qtAdmin')}
                      </a>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-bible-dark hover:bg-bible-warm/30 transition-colors"
                    >
{t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="text-bible-muted hover:text-bible-gold transition-colors">
                {t('nav.login')}
              </a>
              <a href="/register" className="btn-primary text-sm py-2 px-4">
                {t('nav.register')}
              </a>
            </>
          )}
        </nav>

        {/* 移动端菜单按钮 */}
        <button
          className="sm:hidden p-1.5 text-bible-dark hover:text-bible-gold"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={t('nav.openMenu')}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 移动端下拉菜单 */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-bible-warm bg-white/95 px-4 py-3 space-y-3">
          {/* 移动端语言切换 */}
          <button
            onClick={swapLang}
            className="text-xs px-2 py-1 rounded border border-bible-warm text-bible-muted hover:text-bible-gold hover:border-bible-gold transition-colors"
          >
            {lang === 'zh' ? '한글' : '中文'}
          </button>
          {isLoggedIn ? (
            <>
              <a
                href="/messages"
                className="block text-bible-dark hover:text-bible-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
{t('nav.messages')}
              </a>
              <a
                href="/fellowship"
                className="block text-bible-dark hover:text-bible-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.fellowship')}
              </a>
              <a
                href="/profile"
                className="block text-bible-dark hover:text-bible-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.profile')}
              </a>
              {isAdmin && (
                <a
                  href="/qt-admin"
                  className="block text-amber-700 font-medium hover:text-amber-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.qtAdmin')}
                </a>
              )}
              <button
                onClick={handleLogout}
                className="block text-bible-dark hover:text-bible-gold"
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <a
                href="/login"
                className="text-bible-muted hover:text-bible-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.login')}
              </a>
              <a
                href="/register"
                className="btn-primary text-sm py-2 px-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.register')}
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
