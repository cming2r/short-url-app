// 根路徑頁面 - 只使用英文版
import { Suspense } from 'react';
// 複製 HomePage.js 到 components/HomePage.js 而不是使用 [locale] 路徑
import ClientPage from '@/components/HomePage';

// 首頁懸掛狀態顯示元件
function HomePageLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-pulse text-center">
        <div className="text-xl font-bold mb-2">Loading...</div>
        <div className="text-gray-500">Please wait</div>
      </div>
    </div>
  );
}

// 引入共享元數據生成工具
import { generateMetadata as baseGenerateMetadata } from '@/lib/utils/metadata';

// 設置根路徑 (英文) 的元數據
export const metadata = baseGenerateMetadata({
  title: 'URL Shortener - Create Short URLs Instantly',
  description: 'Free URL shortener service - Create short, memorable links that redirect to your original URL. Track clicks, create custom links, and manage your URLs with ease.',
  path: '/',
  ogImagePath: '/og-image.png',
});

// 簡單清除語言設置的腳本
const clearLanguageScript = `
  if (typeof window !== 'undefined' && window.location.pathname === '/') {
    // 在首頁上清除語言偏好，確保不會自動切換
    localStorage.removeItem('language');
    document.documentElement.lang = 'en';
  }
`;

export default function Home() {
  // 根路徑直接顯示英文版
  return (
    <>
      {/* 插入簡單的語言清除腳本 */}
      <script dangerouslySetInnerHTML={{ __html: clearLanguageScript }} />
      <Suspense fallback={<HomePageLoading />}>
        <ClientPage locale="en" />
      </Suspense>
    </>
  );
}