'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { useTranslation } from '@/lib/i18n';

export default function Footer() {
  const { t, changeLanguage } = useTranslation();
  const pathname = usePathname();
  
  // 設定預設為英文
  const currentLocale = 'en';
  
  return (
    <footer className="bg-gray-800 text-white p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          {/* 只保留英文選項的語言選擇器 */}
          <div className="flex items-center w-1/4">
            <span className="mr-2 text-sm text-gray-400">{t.common.language}:</span>
            <select
              value="en"
              className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-600"
            >
              <option value="en">English</option>
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
                <Link 
                  href="/" 
                  className="hover:text-blue-300 transition-colors"
                >
                  {t.common.home}
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="hover:text-blue-300 transition-colors"
                >
                  {t.common.privacy}
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
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