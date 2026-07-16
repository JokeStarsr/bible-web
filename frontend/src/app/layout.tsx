import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '圣经灵修 - 每日领受神的话语',
  description: '以经文随机领受、深度解经、灵修记录、信徒互动为核心的线上灵修平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <header className="border-b border-bible-warm bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-bible-gold tracking-wide">
              📖 圣经灵修
            </a>
            <nav className="flex items-center gap-4 text-sm">
              <a href="/login" className="text-bible-muted hover:text-bible-gold transition-colors">登录</a>
              <a href="/register" className="btn-primary text-sm py-2 px-4">注册</a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}