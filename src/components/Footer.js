'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { useTranslation } from '@/lib/i18n';

export default function Footer() {
  const { t, changeLanguage } = useTranslation();
  const pathname = usePathname();
  
  // 從路徑獲取當前語言
  const getCurrentUrlLocale = () => {
    // 獲取當前路徑的第一個部分作為語言前綴
    const pathParts = pathname.split('/').filter(Boolean);
    return pathParts[0] === 'en' ? 'en' : 'tw';
  };
  
  const currentLocale = getCurrentUrlLocale();
  
  // 處理語言切換
  const handleLanguageChange = (newLocale) => {
    if (newLocale === currentLocale) return;
    
    // 先獲取當前路徑，然後替換語言部分
    const urlParts = pathname.split('/').filter(Boolean);
    if (urlParts.length > 0 && (urlParts[0] === 'en' || urlParts[0] === 'tw')) {
      urlParts[0] = newLocale;
    } else {
      urlParts.unshift(newLocale);
    }
    
    // 更新語言狀態
    changeLanguage(newLocale);
    
    // 重定向到新的本地化路徑
    window.location.href = `/${urlParts.join('/')}`;
  };
  
  return (
    <footer className="bg-gray-800 text-white p-6">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-4">
          <a 
            href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://short-url.com'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-300 transition-colors"
          >
            {process.env.NEXT_PUBLIC_BASE_URL || 'https://short-url.com'}
          </a>
          <p className="text-sm text-gray-400 mt-1">&copy; {new Date().getFullYear()}</p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* 語言切換 - 左側 */}
          <div className="flex items-center order-2 md:order-1">
            <span className="mr-2 text-sm text-gray-400">{t.common.language}:</span>
            <select
              value={currentLocale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600"
            >
              <option value="en">English</option>
              <option value="tw">中文</option>
            </select>
          </div>
          
          {/* 導航連結 - 右側 */}
          <nav className="order-1 md:order-2">
            <ul className="flex flex-wrap justify-center gap-4 md:gap-8">
              <li>
                <Link href={`/${currentLocale}`} className="hover:text-blue-300 transition-colors">
                  {t.common.home}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/privacy`} className="hover:text-blue-300 transition-colors">
                  {t.common.privacy}
                </Link>
              </li>
              <li>
                <Link href={`/${currentLocale}/terms`} className="hover:text-blue-300 transition-colors">
                  {t.common.terms}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}