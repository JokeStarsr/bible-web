'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

interface FeatureLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  bg: string;
  hover: string;
  text: string;
  onClick?: () => void;
}

const FeatureLink = ({ href, label, icon, bg, hover, text, onClick }: FeatureLinkProps) => (
  <a
    href={href}
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${bg} ${hover} ${text} shadow-sm`}
  >
    {icon}
    <span>{label}</span>
  </a>
);

export default function NavBar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
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

  const featureLinks: FeatureLinkProps[] = [
    {
      href: '/daily-thought',
      label: '今日随想',
      bg: 'bg-amber-50',
      hover: 'hover:bg-amber-100',
      text: 'text-amber-700',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      href: '/maps',
      label: '圣经地图',
      bg: 'bg-indigo-50',
      hover: 'hover:bg-indigo-100',
      text: 'text-indigo-700',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      href: '/?contact=open',
      label: '联系牧者',
      bg: 'bg-emerald-50',
      hover: 'hover:bg-emerald-100',
      text: 'text-emerald-700',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <header className="border-b border-bible-warm bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="text-xl font-bold text-bible-gold tracking-wide">
          📖 圣经灵修
        </a>

        {/* 桌面导航：仅保留用户入口 */}
        <nav className="hidden sm:flex items-center gap-4 text-sm">
          {isLoggedIn ? (
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
                    个人中心
                  </a>
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
              <a href="/login" className="text-bible-muted hover:text-bible-gold transition-colors">
                登录
              </a>
              <a href="/register" className="btn-primary text-sm py-2 px-4">
                注册
              </a>
            </>
          )}
        </nav>

        {/* 移动端菜单按钮 */}
        <button
          className="sm:hidden p-1.5 text-bible-dark hover:text-bible-gold"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="打开菜单"
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

      {/* 功能入口栏：今日随想 / 圣经地图 / 联系牧者 */}
      <div className="hidden sm:block border-t border-bible-warm/50 bg-bible-cream/50">
        <div className="max-w-5xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-center gap-4">
            {featureLinks.map((link) => (
              <FeatureLink key={link.href} {...link} />
            ))}
          </div>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-bible-warm bg-white/95 px-4 py-3 space-y-3">
          <div className="flex flex-wrap gap-3">
            {featureLinks.map((link) => (
              <FeatureLink key={link.href} {...link} onClick={() => setMobileMenuOpen(false)} />
            ))}
          </div>
          {isLoggedIn ? (
            <>
              <a
                href="/profile"
                className="block text-bible-dark hover:text-bible-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                个人中心
              </a>
              <button
                onClick={handleLogout}
                className="block text-bible-dark hover:text-bible-gold"
              >
                退出登录
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <a
                href="/login"
                className="text-bible-muted hover:text-bible-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                登录
              </a>
              <a
                href="/register"
                className="btn-primary text-sm py-2 px-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                注册
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
