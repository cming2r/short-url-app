'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { useTranslation } from '@/lib/i18n';
import enTranslations from '@/lib/i18n/en';

export default function Footer() {
  const { t, changeLanguage } = useTranslation();
  const pathname = usePathname();
  
  // 從路徑獲取當前語言
  const currentLocale = (pathname && pathname.startsWith('/tw/')) || pathname === '/tw' ? 'tw' : 'en';
  
  return (
    <footer className="bg-gray-800 text-white p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          {/* 恢復中英文版本的語言選擇器 */}
          <div className="flex items-center w-1/4">
            <span className="mr-2 text-sm text-gray-400">{t.common.language}:</span>
            <select
              value={currentLocale}
              onChange={(e) => {
                // 新的語言選擇
                const newLocale = e.target.value;
                
                // 當前路徑
                const path = pathname;
                
                // 用正則表達式分解路徑
                const pathParts = path.split('/').filter(Boolean);
                console.log('路徑部分:', pathParts);
                
                let newPath;
                
                // 特殊處理主頁
                if (path === '/' || path === '/tw' || path === '/en') {
                  newPath = newLocale === 'en' ? '/' : '/tw';
                }
                // 其他所有路徑
                else {
                  // 如果路徑以 /tw/ 或 /en/ 開頭，提取路徑的其餘部分
                  let pagePath = path;
                  if (pathParts.length > 0 && (pathParts[0] === 'tw' || pathParts[0] === 'en')) {
                    pagePath = '/' + pathParts.slice(1).join('/');
                  }
                  
                  // 根據所選語言添加正確的前綴
                  newPath = newLocale === 'en' ? pagePath : `/tw${pagePath}`;
                }
                
                console.log(`語言切換處理: ${path} → ${newPath}`);
                
                // 使用替換方法而非重定向，更新整個URL
                window.location.replace(newPath);
              }}
              className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600"
            >
              <option value="en">English</option>
              <option value="tw">中文</option>
            </select>
          </div>
          
          {/* 版權信息 - 中間 (使用固定寬度確保置中) */}
          <div className="text-center w-1/2 order-first md:order-none mb-2 md:mb-0">
            <p className="text-white font-medium">©2025 vvrl.cc</p>
          </div>
          
          {/* 導航連結 - 右側 */}
          <nav className="w-1/4 flex justify-end">
            <ul className="flex flex-wrap justify-center gap-4">
              <li>
                {pathname === '/' ? (
                  // 在主頁上，所有連結都指向英文版
                  <Link href="/" className="hover:text-blue-300 transition-colors">{t.common.home}</Link>
                ) : (pathname.startsWith('/tw/') || pathname === '/tw') ? (
                  // 在中文頁面上，所有連結都指向中文版
                  <Link href="/tw" className="hover:text-blue-300 transition-colors">{t.common.home}</Link>
                ) : (
                  // 在其他英文頁面上，所有連結都指向英文版
                  <Link href="/" className="hover:text-blue-300 transition-colors">{t.common.home}</Link>
                )}
              </li>
              <li>
                {pathname === '/' ? (
                  // 在主頁上，所有連結都指向英文版
                  <Link href="/privacy-policy" className="hover:text-blue-300 transition-colors">{t.common.privacy}</Link>
                ) : (pathname.startsWith('/tw/') || pathname === '/tw') ? (
                  // 在中文頁面上，所有連結都指向中文版
                  <Link href="/tw/privacy-policy" className="hover:text-blue-300 transition-colors">{t.common.privacy}</Link>
                ) : (
                  // 在其他英文頁面上，所有連結都指向英文版
                  <Link href="/privacy-policy" className="hover:text-blue-300 transition-colors">{t.common.privacy}</Link>
                )}
              </li>
              <li>
                {pathname === '/' ? (
                  // 在主頁上，所有連結都指向英文版
                  <Link href="/terms" className="hover:text-blue-300 transition-colors">{t.common.terms}</Link>
                ) : (pathname.startsWith('/tw/') || pathname === '/tw') ? (
                  // 在中文頁面上，所有連結都指向中文版
                  <Link href="/tw/terms" className="hover:text-blue-300 transition-colors">{t.common.terms}</Link>
                ) : (
                  // 在其他英文頁面上，所有連結都指向英文版
                  <Link href="/terms" className="hover:text-blue-300 transition-colors">{t.common.terms}</Link>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}