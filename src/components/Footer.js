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
                // 取得目前完整路徑
                const path = pathname;
                // 根據當前語言決定路徑格式
                const isLocalized = path.startsWith('/tw/') || path.startsWith('/en/');
                
                // 決定新路徑
                let newPath;
                const newLocale = e.target.value;
                
                // 如果是主頁
                if (path === '/' || path === '/tw' || path === '/en') {
                  newPath = newLocale === 'en' ? '/' : `/${newLocale}`;
                }
                // 如果是語言路徑
                else if (isLocalized) {
                  const pathParts = path.split('/').filter(Boolean);
                  const restPath = pathParts.slice(1).join('/');
                  newPath = newLocale === 'en' ? `/${restPath}` : `/${newLocale}/${restPath}`;
                }
                // 如果是純英文路徑
                else {
                  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
                  newPath = newLocale === 'en' ? path : `/${newLocale}/${cleanPath}`;
                }
                
                console.log(`切換語言: ${currentLocale} -> ${newLocale}, 路徑: ${path} -> ${newPath}`);
                
                // 更新語言並跳轉
                changeLanguage(newLocale);
                window.location.href = newPath;
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