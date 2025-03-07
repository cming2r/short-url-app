// 根路徑頁面 - 直接顯示英文內容
import { Suspense } from 'react';
import ClientPage from './[locale]/components/HomePage';

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

// 設置根路徑 (英文) 的元數據
export const metadata = {
  title: 'URL Shortener - Create Short URLs Instantly | vvrl.cc',
  description: 'Free URL shortener service - Create short, memorable links that redirect to your original URL. Track clicks, create custom links, and manage your URLs with ease.',
  keywords: 'URL shortener, short URL, link shortener, URL tracker, custom short links, free link shortener',
  
  // Root path (English) SEO settings - 明確的 hreflang 和規範連結配置
  alternates: {
    canonical: 'https://vvrl.cc/',
    languages: {
      'en': 'https://vvrl.cc/',
      'zh-TW': 'https://vvrl.cc/tw',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://vvrl.cc/',
    title: 'URL Shortener - Create Short URLs Instantly',
    description: 'Free URL shortener service with tracking, custom links, and more. No registration required for basic URL shortening.',
    images: [{ url: 'https://vvrl.cc/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URL Shortener - Create Short URLs Instantly',
    description: 'Free URL shortener service with tracking, custom links, and more.',
    images: ['https://vvrl.cc/og-image.png'],
  },
};

export default function Home() {
  // 根路徑直接顯示英文版
  return (
    <Suspense fallback={<HomePageLoading />}>
      <ClientPage locale="en" />
    </Suspense>
  );
}