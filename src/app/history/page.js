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

// 強制使用英文的客戶端腳本
const forceEnglishScript = `
  (function() {
    // 檢查當前是否正好在 /history 路徑（不是 /tw/history）
    if (window.location.pathname === '/history') {
      console.log('強制使用英文版 /history');
      localStorage.removeItem('language');
      document.documentElement.lang = 'en';
      
      // 檢查是否有重定向
      const checkRedirectInterval = setInterval(function() {
        // 如果 URL 已經改變，但仍然在相同頁面上
        if (window.location.pathname.includes('/tw/history')) {
          console.log('檢測到重定向到 /tw/history，強制回到 /history');
          window.location.href = '/history';
          clearInterval(checkRedirectInterval);
        }
      }, 100);
      
      // 5秒後清除檢查
      setTimeout(function() {
        clearInterval(checkRedirectInterval);
      }, 5000);
    }
  })();
`;

// 伺服器組件作為入口，包裝客戶端組件
export default async function HistoryPage() {
  return (
    <>
      {/* 插入強制英文腳本 */}
      <script dangerouslySetInnerHTML={{ __html: forceEnglishScript }} />
      <Suspense fallback={<HistoryPageLoading />}>
        <HistoryPageClient locale="en" />
      </Suspense>
    </>
  );
}