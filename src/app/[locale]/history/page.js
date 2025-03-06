// 伺服器組件部分
import { Suspense } from 'react';
import { DEFAULT_LOCALE } from '@/lib/i18n/constants';
import HistoryPageClient from './components/HistoryClient';

// 加載中顯示
function HistoryPageLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-pulse text-center">
        <div className="text-xl font-bold mb-2">載入中...</div>
        <div className="text-gray-500">請稍後</div>
      </div>
    </div>
  );
}

// 伺服器組件作為入口，包裝客戶端組件
export default async function HistoryPage({ params }) {
  // 在 Next.js 15 中，需要 await params 才能訪問其屬性
  const resolvedParams = await params;
  const locale = String(resolvedParams?.locale || DEFAULT_LOCALE);
  
  return (
    <Suspense fallback={<HistoryPageLoading />}>
      <HistoryPageClient locale={locale} />
    </Suspense>
  );
}