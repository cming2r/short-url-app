// 英文版自訂短網址頁面
import { Suspense } from 'react';
import CustomUrlPageClient from '@/lib/components/CustomUrlClient';

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

// 引入共享元數據生成工具
import { generateMetadata as baseGenerateMetadata } from '@/lib/utils/metadata';

// 設置英文版自訂短網址頁面的SEO元數據
export const metadata = baseGenerateMetadata({
  title: 'Custom URL - Create Your Personalized Short URL',
  description: 'Create your own personalized short URL with our custom URL feature. Simple to use and easy to remember. Free customized short links.',
  path: '/custom',
  ogImagePath: '/og-image.png', // 您可以使用特定圖片如 '/og-custom.png'
});

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
        <CustomUrlPageClient locale="disable" />
      </Suspense>
    </>
  );
}