// 英文版自訂短網址頁面
import { Suspense } from 'react';
import CustomUrlPageClient from '@/components/shared/CustomUrlClient';

// 加載中顯示
function CustomPageLoading() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-pulse text-center">
        <div className="text-xl font-bold mb-2">Loading...</div>
        <div className="text-gray-500">Please wait</div>
      </div>
    </div>
  );
}

// 設置英文版自訂短網址頁面的SEO元數據
export const metadata = {
  title: 'Custom URL - Create Your Personalized Short URL',
  description: 'Create your own personalized short URL with our custom URL feature. Simple to use and easy to remember.',
  
  // 明確的 hreflang 和規範連結配置
  alternates: {
    canonical: 'https://vvrl.cc/custom',
    languages: {
      'en': 'https://vvrl.cc/custom',
      'zh-TW': 'https://vvrl.cc/tw/custom',
    },
  },
};

// 強制使用英文的客戶端腳本
const forceEnglishScript = `
  (function() {
    // 檢查當前是否正好在 /custom 路徑（不是 /tw/custom）
    if (window.location.pathname === '/custom') {
      console.log('強制使用英文版 /custom');
      localStorage.removeItem('language');
      document.documentElement.lang = 'en';
      
      // 檢查是否有重定向
      const checkRedirectInterval = setInterval(function() {
        // 如果 URL 已經改變，但仍然在相同頁面上
        if (window.location.pathname.includes('/tw/custom')) {
          console.log('檢測到重定向到 /tw/custom，強制回到 /custom');
          window.location.href = '/custom';
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
export default async function CustomPage() {
  return (
    <>
      {/* 插入強制英文腳本 */}
      <script dangerouslySetInnerHTML={{ __html: forceEnglishScript }} />
      <Suspense fallback={<CustomPageLoading />}>
        <CustomUrlPageClient locale="en" />
      </Suspense>
    </>
  );
}