'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; 
import { useTranslation } from '@/lib/i18n';

export default function Footer() {
  const { t } = useTranslation();
  const pathname = usePathname();
  
  // 從路徑獲取當前語言
  const getCurrentUrlLocale = () => {
    // 獲取當前路徑的第一個部分作為語言前綴
    const pathParts = pathname.split('/').filter(Boolean);
    return pathParts[0] === 'en' ? 'en' : 'tw';
  };
  
  const currentLocale = getCurrentUrlLocale();
  
  return (
    <footer className="bg-gray-800 text-white p-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold">{t.common.appName}</h3>
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} {t.common.appName}</p>
          </div>
          
          <nav>
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