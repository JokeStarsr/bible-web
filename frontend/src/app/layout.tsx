import type { Metadata } from 'next';
import './globals.css';
import NavBar from '@/components/NavBar';

export const metadata: Metadata = {
  title: '圣经灵修 - 每日领受神的话语',
  description: '以经文随机领受、深度解经、灵修记录、信徒互动为核心的线上灵修平台',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased flex flex-col">
        <NavBar />
        <div className="w-full bg-red-50 border-b border-red-100">
          <div className="max-w-5xl mx-auto px-4 py-2.5 text-center">
            <p className="text-red-600 font-bold text-sm md:text-base">
              亲爱的小羊们，这里的所有话语只提供参考，我们跟神的关系还是取决于各自的祷告和圣灵的感动。
            </p>
          </div>
        </div>
        <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
          {children}
        </main>
      </body>
    </html>
  );
}