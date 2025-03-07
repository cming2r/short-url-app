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
    
    // 如果路徑為空或不是 /tw 開頭，則為英文
    if (pathParts.length === 0 || pathParts[0] !== 'tw') {
      return 'en';
    }
    
    return 'tw';
  };
  
  const currentLocale = getCurrentUrlLocale();
  
  // 處理語言切換 - 針對新的 URL 結構 (根路徑為英文)
  const handleLanguageChange = (newLocale) => {
    if (newLocale === currentLocale) return;
    
    // 獲取當前路徑，不含語言前綴部分
    const urlParts = pathname.split('/').filter(Boolean);
    let pathWithoutLocale = '';
    
    // 如果路徑有內容且第一個部分是語言代碼，則去除第一個部分
    if (urlParts.length > 0 && (urlParts[0] === 'en' || urlParts[0] === 'tw')) {
      pathWithoutLocale = urlParts.slice(1).join('/');
    } else {
      // 如果沒有語言代碼，直接使用完整路徑
      pathWithoutLocale = urlParts.join('/');
    }
    
    // 生成新路徑
    let newPath;
    if (newLocale === 'en') {
      // 英文應該是根路徑，後面跟著其他部分
      newPath = pathWithoutLocale ? `/${pathWithoutLocale}` : '/';
    } else {
      // 中文需要添加 /tw 前綴
      newPath = pathWithoutLocale ? `/tw/${pathWithoutLocale}` : '/tw';
    }
    
    // 更新語言狀態
    changeLanguage(newLocale);
    
    // 重定向到新的本地化路徑
    window.location.href = newPath;
  };
  
  return (
    <footer className="bg-gray-800 text-white p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          {/* 語言切換 - 左側 */}
          <div className="flex items-center">
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
          
          {/* 版權信息 - 中間 */}
          <div className="text-center order-first md:order-none mb-2 md:mb-0">
            <p className="text-white font-medium">©2025 vvrl.cc</p>
          </div>
          
          {/* 導航連結 - 右側 */}
          <nav>
            <ul className="flex flex-wrap justify-center gap-4">
              <li>
                <Link 
                  href={currentLocale === 'en' ? '/' : '/tw'} 
                  className="hover:text-blue-300 transition-colors"
                >
                  {t.common.home}
                </Link>
              </li>
              <li>
                <Link 
                  href={currentLocale === 'en' ? '/privacy-policy' : '/tw/privacy-policy'} 
                  className="hover:text-blue-300 transition-colors"
                >
                  {t.common.privacy}
                </Link>
              </li>
              <li>
                <Link 
                  href={currentLocale === 'en' ? '/terms' : '/tw/terms'} 
                  className="hover:text-blue-300 transition-colors"
                >
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