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
  title: 'Custom URL - Create Your Personalized Short URL | vvrl.cc',
  description: 'Create your own personalized short URL with our custom URL feature. Simple to use and easy to remember. Free customized short links.',
  keywords: 'custom URL, personalized URL, short link, branded link, custom short URL, custom link',
  
  // 只有英文版的規範連結配置
  alternates: {
    canonical: 'https://vvrl.cc/custom',
  },
  openGraph: {
    type: 'website',
    url: 'https://vvrl.cc/custom',
    title: 'Custom URL - Create Your Personalized Short URL',
    description: 'Create your own personalized short URL with our custom URL feature. Simple to use and easy to remember.',
    images: [{ url: 'https://vvrl.cc/og-custom.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Custom URL - Create Your Personalized Short URL',
    description: 'Create your own personalized short URL with vvrl.cc',
    images: ['https://vvrl.cc/og-custom.png'],
  },
};

// 清除語言設置的簡單腳本
const clearLanguageScript = `
  if (typeof window !== 'undefined' && window.location.pathname === '/custom') {
    // 在英文頁面上清除語言偏好，確保不會自動切換
    localStorage.removeItem('language');
  }
`;

// 伺服器組件作為入口，包裝客戶端組件
export default async function CustomPage() {
  return (
    <>
      {/* 插入簡單的語言清除腳本 */}
      <script dangerouslySetInnerHTML={{ __html: clearLanguageScript }} />
      <Suspense fallback={<CustomPageLoading />}>
        <CustomUrlPageClient locale="en" />
      </Suspense>
    </>
  );
}