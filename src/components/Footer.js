'use client';

import { useTranslation, LanguageSelector } from '@/lib/i18n';

export default function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p>© {new Date().getFullYear()} {t.common.appName}. All rights reserved.</p>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <div className="mb-2">
              <LanguageSelector />
            </div>
            
            <div className="text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors mr-4">
                隱私政策
              </a>
              <a href="#" className="hover:text-white transition-colors">
                使用條款
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}