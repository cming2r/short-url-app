import React, { Suspense } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DEFAULT_LOCALE } from '@/lib/i18n/constants';

// 使用客戶端組件來處理翻譯
const NotFoundContent = ({ locale }) => {
  // 中文內容
  const zhContent = (
    <div className="text-center px-4 py-16 max-w-md">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">網址不存在</h2>
      <p className="text-gray-600 mb-8">您嘗試訪問的短網址不存在或已過期。</p>
      <Link 
        href={`/tw`} 
        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition-colors"
      >
        返回首頁
      </Link>
    </div>
  );

  // 英文內容
  const enContent = (
    <div className="text-center px-4 py-16 max-w-md">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">URL Not Found</h2>
      <p className="text-gray-600 mb-8">The short URL you tried to access does not exist or has expired.</p>
      <Link 
        href={`/en`} 
        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );

  return locale === 'zh-TW' ? zhContent : enContent;
};

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'tw' }];
}

export default async function NotFound({ params }) {
  const resolvedParams = await params;
  const locale = String(resolvedParams?.locale || DEFAULT_LOCALE);
  
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow bg-gray-50 flex items-center justify-center">
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
          <NotFoundContent locale={locale === 'tw' ? 'zh-TW' : locale} />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}