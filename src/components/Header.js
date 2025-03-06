'use client';

import { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SupabaseContext } from './SupabaseProvider';
import { useTranslation } from '@/lib/i18n';

export default function Header() {
  // 使用來自 SupabaseProvider 的會話狀態
  const supabaseContext = useContext(SupabaseContext);
  const { t, getUrlLocale, changeLanguage } = useTranslation();
  const [session, setSession] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // 從路徑獲取當前語言
  const getCurrentUrlLocale = () => {
    // 獲取當前路徑的第一個部分作為語言前綴
    const pathParts = pathname.split('/').filter(Boolean);
    return pathParts[0] === 'en' ? 'en' : 'tw';
  };
  
  const currentLocale = getCurrentUrlLocale();
  
  // 從上下文中獲取會話
  useEffect(() => {
    if (supabaseContext) {
      setSession(supabaseContext.session);
    }
  }, [supabaseContext]);

  // 處理登入
  const handleSignIn = async () => {
    // 檢測當前環境
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    // 取得當前完整 URL 路徑
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // 根據環境選擇適當的重定向 URL，保留完整的當前路徑
    const redirectUrl = isLocalhost 
      ? `http://localhost:3000${currentPath}` 
      : `https://short-url-app-olive.vercel.app${currentPath}`;
    
    console.log('登入重定向URL:', redirectUrl);
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        }
      });
      
      if (error) throw error;
      
      // 添加 localStorage 標記，表示認證流程已啟動
      localStorage.setItem('authInProgress', 'true');
      localStorage.setItem('authStartPath', currentPath);
      
    } catch (error) {
      console.error('登入錯誤:', error);
    }
  };

  // 處理登出 - 直接使用上下文提供的方法
  const handleSignOut = async () => {
    console.log('嘗試登出...');
    try {
      if (supabaseContext && typeof supabaseContext.signOut === 'function') {
        await supabaseContext.signOut();
      }
    } catch (error) {
      console.error('登出過程中發生錯誤:', error);
    }
  };
  
  // 構建頁面 URL 函數
  function getLocalizedHref(path) {
    // 移除開頭的 /
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    if (cleanPath === '') {
      return `/${currentLocale}`;
    }
    
    return `/${currentLocale}/${cleanPath}`;
  }

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
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex justify-between items-center w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-xl font-bold">
            <Link href={getLocalizedHref('')} className="hover:underline transition-colors">{t.common.appName}</Link>
          </h1>
          {/* 漢堡菜單按鈕 - 在小屏幕上顯示 */}
          <button 
            className="md:hidden text-white hover:text-gray-300 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        {/* 桌面和移動導航 */}
        <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-auto`}>
          <ul className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-6 items-center">
            <li>
              <Link href={getLocalizedHref('')} className="hover:text-blue-300 transition-colors block py-1">{t.common.home}</Link>
            </li>
            {session && (
              <>
                <li>
                  <Link href={getLocalizedHref('custom')} className="hover:text-blue-300 transition-colors block py-1">{t.common.customUrl}</Link>
                </li>
                <li>
                  <Link href={getLocalizedHref('history')} className="hover:text-blue-300 transition-colors block py-1">{t.common.history}</Link>
                </li>
              </>
            )}
            <li>
              {session ? (
                <button 
                  onClick={handleSignOut} 
                  className="hover:text-blue-300 transition-colors block py-1 w-full text-left"
                  title={t.common.logout}
                >
                  <span className="hidden md:inline">{t.common.logout} (</span>
                  <span className="truncate max-w-[150px] inline-block align-bottom">{session.user?.email || t.common.user}</span>
                  <span className="hidden md:inline">)</span>
                </button>
              ) : (
                <button 
                  onClick={handleSignIn} 
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
                >
                  {t.common.login}
                </button>
              )}
            </li>
            {/* 語言切換已移至 Footer */}
          </ul>
        </nav>
      </div>
    </header>
  );
}