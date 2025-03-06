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
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">{t.common.appName}</h3>
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} {t.common.appName}</p>
          </div>
          
          <div className="flex flex-col items-center md:flex-row md:items-center gap-4">
            <nav className="mb-3 md:mb-0 md:mr-6">
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
            
            {/* 語言切換 */}
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-400">{t.common.language || '語言'}:</span>
              <select
                value={currentLocale}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600"
              >
                <option value="en">English</option>
                <option value="tw">中文</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}