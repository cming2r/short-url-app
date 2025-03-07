import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useTranslation } from '@/lib/i18n';
import { DEFAULT_LOCALE } from '@/lib/i18n/constants';

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'tw' }];
}

export default async function NotFound({ params }) {
  const resolvedParams = await params;
  const locale = String(resolvedParams?.locale || DEFAULT_LOCALE);
  
  // 在服務器端設置語言
  const { t } = await useTranslation(null, locale === 'tw' ? 'zh-TW' : locale);
  
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow bg-gray-50 flex items-center justify-center">
        <div className="text-center px-4 py-16 max-w-md">
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6">{t.errors.notFound}</h2>
          <p className="text-gray-600 mb-8">{t.errors.notFoundDescription}</p>
          <Link 
            href={`/${locale === 'zh-TW' ? 'tw' : locale}`} 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition-colors"
          >
            {t.common.backToHome}
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}