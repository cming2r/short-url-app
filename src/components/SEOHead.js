'use client';

import { usePathname } from 'next/navigation';

/**
 * SEO 鏈接組件，添加語言相關的元標籤和鏈接
 * @param {Object} props - 組件屬性
 * @param {string} props.locale - 當前頁面語言代碼 ('en' 或 'tw')
 */
export default function SEOLinks({ locale }) {
  // 獲取當前路徑，用於構建完整 URL
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://short-url-app-olive.vercel.app';
  
  // 獲取當前頁面在不同語言版本的 URL
  const getLocalizedUrl = (targetLocale) => {
    // 從當前路徑中移除語言前綴
    const pathWithoutLocale = pathname.replace(/^\/(en|tw)/, '');
    // 構建新的本地化 URL
    return `${baseUrl}/${targetLocale}${pathWithoutLocale || ''}`;
  };
  
  // 為 HTML 元素設置正確的語言屬性
  const htmlLang = locale === 'tw' ? 'zh-TW' : 'en';
  
  return (
    <>
      {/* 語言屬性設置在 Layout 中 */}
      
      {/* 規範連結 - 始終指向英文版作為主要語言 */}
      <link rel="canonical" href={getLocalizedUrl('en')} />
      
      {/* 語言替代版本連結 */}
      <link rel="alternate" hreflang="en" href={getLocalizedUrl('en')} />
      <link rel="alternate" hreflang="zh-TW" href={getLocalizedUrl('tw')} />
      
      {/* 默認語言版本 */}
      <link rel="alternate" hreflang="x-default" href={getLocalizedUrl('en')} />
    </>
  );
}