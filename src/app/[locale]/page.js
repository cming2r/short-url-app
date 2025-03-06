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