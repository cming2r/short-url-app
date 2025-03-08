'use client';

import { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SupabaseContext } from './SupabaseProvider';
import { useTranslation } from '@/lib/i18n';
import enTranslations from '@/lib/i18n/en';

export default function Header() {
  // 使用來自 SupabaseProvider 的會話狀態
  const supabaseContext = useContext(SupabaseContext);
  const { t, getUrlLocale, changeLanguage } = useTranslation();
  const [session, setSession] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // 從路徑獲取當前語言，強制在主頁使用英文
  // 檢查當前 URL 是否為主頁 '/'
  const isHomePage = pathname === '/';
  const currentLocale = isHomePage ? 'en' : 
                        (pathname && pathname.startsWith('/tw/')) || pathname === '/tw' ? 'tw' : 'en';
  
  console.log(`Header - 當前路徑: ${pathname}, 語言: ${currentLocale}, isHomePage: ${isHomePage}`);
  
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
  
  // 構建頁面 URL 函數 - 依據當前語言返回 URL
  function getLocalizedHref(path) {
    // 清理路徑
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    // 特別處理: 在根路徑 '/' 時，強制使用英文路徑
    if (pathname === '/') {
      const url = cleanPath === '' ? '/' : `/${cleanPath}`;
      console.log(`主頁導航: 強制使用英文路徑 -> ${url}`);
      return url;
    }
    
    // 檢查當前語言，中文版添加 /tw 前綴
    const pathPrefix = currentLocale === 'en' ? '' : `/${getUrlLocale()}`;
    
    // 生成最終 URL
    const url = cleanPath === '' 
      ? pathPrefix || '/' 
      : `${pathPrefix}/${cleanPath}`;
      
    console.log(`生成導航URL: ${url} (原始路徑: ${path}, 語言: ${currentLocale})`);
    
    return url;
  }

  // 移除語言切換功能

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex justify-between items-center w-full md:w-auto mb-4 md:mb-0">
          <h1 className="text-xl font-bold">
            {pathname === '/' ? (
              // 在主頁上，所有連結都指向英文版
              <Link href="/" className="hover:underline transition-colors">{t.common.appName}</Link>
            ) : (pathname.startsWith('/tw/') || pathname === '/tw') ? (
              // 在中文頁面上，所有連結都指向中文版
              <Link href="/tw" className="hover:underline transition-colors">{t.common.appName}</Link>
            ) : (
              // 在其他英文頁面上，所有連結都指向英文版
              <Link href="/" className="hover:underline transition-colors">{t.common.appName}</Link>
            )}
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
              {pathname === '/' ? (
                // 在主頁上，所有連結都指向英文版
                <>
                  <Link href="/" className="hover:text-blue-300 transition-colors block py-1">{t.common.home}</Link>
                </>
              ) : (pathname.startsWith('/tw/') || pathname === '/tw') ? (
                // 在中文頁面上，所有連結都指向中文版
                <>
                  <Link href="/tw" className="hover:text-blue-300 transition-colors block py-1">{t.common.home}</Link>
                </>
              ) : (
                // 在其他英文頁面上，所有連結都指向英文版
                <>
                  <Link href="/" className="hover:text-blue-300 transition-colors block py-1">{t.common.home}</Link>
                </>
              )}
            </li>
            <li>
              {pathname === '/' ? (
                // 在主頁上，所有連結都指向英文版
                <>
                  <Link href="/custom" className="hover:text-blue-300 transition-colors block py-1 group relative">
                    {t.common.customUrl}
                    {!session && (
                      <span className="absolute -top-1 -right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    )}
                  </Link>
                </>
              ) : (pathname.startsWith('/tw/') || pathname === '/tw') ? (
                // 在中文頁面上，所有連結都指向中文版
                <>
                  <Link href="/tw/custom" className="hover:text-blue-300 transition-colors block py-1 group relative">
                    {t.common.customUrl}
                    {!session && (
                      <span className="absolute -top-1 -right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    )}
                  </Link>
                </>
              ) : (
                // 在其他英文頁面上，所有連結都指向英文版
                <>
                  <Link href="/custom" className="hover:text-blue-300 transition-colors block py-1 group relative">
                    {t.common.customUrl}
                    {!session && (
                      <span className="absolute -top-1 -right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    )}
                  </Link>
                </>
              )}
            </li>
            <li>
              {pathname === '/' ? (
                // 在主頁上，所有連結都指向英文版
                <>
                  <Link href="/history" className="hover:text-blue-300 transition-colors block py-1 group relative">
                    {t.common.history}
                    {!session && (
                      <span className="absolute -top-1 -right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    )}
                  </Link>
                </>
              ) : (pathname.startsWith('/tw/') || pathname === '/tw') ? (
                // 在中文頁面上，所有連結都指向中文版
                <>
                  <Link href="/tw/history" className="hover:text-blue-300 transition-colors block py-1 group relative">
                    {t.common.history}
                    {!session && (
                      <span className="absolute -top-1 -right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    )}
                  </Link>
                </>
              ) : (
                // 在其他英文頁面上，所有連結都指向英文版
                <>
                  <Link href="/history" className="hover:text-blue-300 transition-colors block py-1 group relative">
                    {t.common.history}
                    {!session && (
                      <span className="absolute -top-1 -right-2 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                      </span>
                    )}
                  </Link>
                </>
              )}
            </li>
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