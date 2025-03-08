import { DEFAULT_LOCALE } from '@/lib/i18n/constants';
import { Suspense } from 'react';
import ClientPage from './components/HomePage';

// 靜態生成英文和中文兩個版本
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'tw' }
  ];
}

// 首頁懸掛狀態顯示元件
function HomePageLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-pulse text-center">
        <div className="text-xl font-bold mb-2">載入中...</div>
        <div className="text-gray-500">請稍後</div>
      </div>
    </div>
  );
}

// 根據語言設置元數據
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = String(resolvedParams.locale || DEFAULT_LOCALE);
  
  // 根據語言設置不同的元數據
  if (locale === 'tw') {
    return {
      title: '網址縮短器 - 立即創建短網址 | vvrl.cc',
      description: '免費網址縮短服務 - 創建短小好記的連結，重定向到您的原始網址。追蹤點擊量，創建自訂連結，並輕鬆管理您的網址。',
      keywords: '網址縮短器, 短網址, 連結縮短器, 網址追蹤器, 自訂短連結, 免費連結縮短',
      alternates: {
        canonical: 'https://vvrl.cc/tw', // 中文版的 canonical
        languages: {
          'en': 'https://vvrl.cc/', // 指向英文版
          'zh-TW': 'https://vvrl.cc/tw', // 指向自己
        },
      },
    };
  } else {
    return {
      title: 'URL Shortener - Create Short URLs Instantly | vvrl.cc',
      description: 'Free URL shortener service - Create short, memorable links that redirect to your original URL. Track clicks, create custom links, and manage your URLs with ease.',
      keywords: 'URL shortener, short URL, link shortener, URL tracker, custom short links, free link shortener',
      alternates: {
        canonical: 'https://vvrl.cc/', // 英文版的 canonical 是根路徑
        languages: {
          'en': 'https://vvrl.cc/',
          'zh-TW': 'https://vvrl.cc/tw',
        },
      },
    };
  }
}

// 使用 async 函數並正確 await params 參數
export default async function Page({ params }) {
  // 在 Next.js 15 中，需要 await params 才能訪問其屬性
  const resolvedParams = await params;
  const locale = String(resolvedParams.locale || DEFAULT_LOCALE);
  
  // 使用 Suspense 包裹 ClientPage 組件，因為它使用了 useSearchParams
  return (
    <Suspense fallback={<HomePageLoading />}>
      <ClientPage locale={locale} />
    </Suspense>
  );
}