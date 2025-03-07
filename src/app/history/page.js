// 英文版歷史記錄頁面
import { Suspense } from 'react';
import HistoryPageClient from '@/components/shared/HistoryClient';

// 加載中顯示
function HistoryPageLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-pulse text-center">
        <div className="text-xl font-bold mb-2">Loading...</div>
        <div className="text-gray-500">Please wait</div>
      </div>
    </div>
  );
}

// 設置英文版歷史頁面的SEO元數據
export const metadata = {
  title: 'URL History - View Your Shortened URLs',
  description: 'View and manage your history of shortened URLs. Track clicks, copy links, and delete URLs as needed.',
  
  // 明確的 hreflang 和規範連結配置
  alternates: {
    canonical: 'https://vvrl.cc/history',
    languages: {
      'en': 'https://vvrl.cc/history',
      'zh-TW': 'https://vvrl.cc/tw/history',
    },
  },
};

// 伺服器組件作為入口，包裝客戶端組件
export default async function HistoryPage() {
  return (
    <Suspense fallback={<HistoryPageLoading />}>
      <HistoryPageClient locale="en" />
    </Suspense>
  );
}