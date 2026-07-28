import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';
import I18nBanner from '@/components/I18nBanner';
import { I18nProvider } from '@/i18n/I18nContext';

export const metadata: Metadata = {
  title: '圣经灵修 - 每日领受神的话语',
  description: '以经文随机领受、深度解经、灵修记录、信徒互动为核心的线上灵修平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased flex flex-col">
        <I18nProvider>
          <NavBar />
          <I18nBanner />
          <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
            {children}
          </main>
        </I18nProvider>
      </body>
    </html>
  );
}
