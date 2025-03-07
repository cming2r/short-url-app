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

// 伺服器組件作為入口，包裝客戶端組件
export default async function CustomPage() {
  return (
    <Suspense fallback={<CustomPageLoading />}>
      <CustomUrlPageClient locale="en" />
    </Suspense>
  );
}