'use client';

import { useState, useEffect, useContext } from 'react';
import { supabase, getCurrentSiteUrl } from '@/lib/supabase';
import Link from 'next/link';
import { SupabaseContext } from './SupabaseProvider';

export default function Header() {
  // 使用來自 SupabaseProvider 的會話狀態
  const supabaseContext = useContext(SupabaseContext);
  const [session, setSession] = useState(null);
  
  // 從上下文中獲取會話，同時保持本地狀態作為備份
  useEffect(() => {
    // 如果上下文中有會話，則使用它
    if (supabaseContext && supabaseContext.session) {
      console.log('從上下文中獲取會話');
      setSession(supabaseContext.session);
    } else {
      // 否則回退到直接從 Supabase 獲取
      console.log('直接從 Supabase 獲取會話');
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });
  
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Header 中的認證狀態變更:', event);
        setSession(session);
      });
  
      return () => {
        console.log('Header 清理會話監聽器');
        authListener.subscription.unsubscribe();
      };
    }
  }, [supabaseContext]);

  const handleSignIn = async () => {
    // 檢測當前環境
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    // 根據環境選擇適當的重定向 URL
    const redirectUrl = isLocalhost 
      ? 'http://localhost:3000' 
      : 'https://short-url-app-olive.vercel.app';
    
    console.log('登入重定向URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      }
    });
    
    if (error) console.error('Error signing in:', error);
  };

  const handleSignOut = async () => {
    console.log('Header 組件嘗試登出...');
    
    // 無論如何，清除會話數據
    const forceSignOut = () => {
      console.log('執行強制登出清理...');
      
      try {
        // 1. 重設 React 狀態
        setSession(null);
        
        // 2. 清除所有相關 localStorage 項目
        if (typeof window !== 'undefined' && window.localStorage) {
          const keysToRemove = [];
          
          // 先收集所有要刪除的鍵
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && 
               (key.startsWith('supabase.') || 
                key.includes('auth') || 
                key.includes('token') || 
                key.includes('session'))) {
              keysToRemove.push(key);
            }
          }
          
          // 然後再刪除，避免在迭代過程中修改集合
          keysToRemove.forEach(key => {
            console.log('清除 localStorage 項:', key);
            try {
              localStorage.removeItem(key);
            } catch (e) {
              console.warn('無法清除 localStorage 項:', key, e);
            }
          });
        }
        
        // 3. 清除所有 cookies
        if (typeof document !== 'undefined' && document.cookie) {
          document.cookie.split(";").forEach(function(c) {
            try {
              const cookieName = c.trim().split("=")[0];
              if (cookieName) {
                document.cookie = cookieName + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
              }
            } catch (e) {
              console.warn('無法清除 cookie:', c, e);
            }
          });
        }
      } catch (e) {
        console.error('強制登出清理出錯:', e);
      }
      
      // 最後，強制重新載入頁面
      try {
        // 延遲確保所有清理操作完成
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            const cacheBuster = new Date().getTime();
            window.location.replace(`${window.location.origin}?forceRefresh=${cacheBuster}`);
          }
        }, 300);
      } catch (e) {
        console.error('頁面重定向失敗:', e);
        // 備用重定向方法
        if (typeof window !== 'undefined') {
          window.location.href = window.location.origin;
        }
      }
    };
    
    try {
      // 嘗試使用 Context 提供的登出方法
      if (supabaseContext && typeof supabaseContext.signOut === 'function') {
        console.log('使用 Context 提供的登出方法');
        try {
          await supabaseContext.signOut();
          // 即使 Context 登出成功，也執行強制清理作為額外保障
          forceSignOut();
          return;
        } catch (e) {
          console.warn('Context 登出方法失敗，使用替代方法:', e);
        }
      }
      
      // 如果沒有 Context 或 Context 登出失敗，嘗試直接使用 Supabase
      console.log('直接使用 Supabase 登出');
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('直接 Supabase 登出失敗，繼續強制清理:', e);
      }
      
      // 無論上面的方法是否成功，都執行徹底的強制清理
      forceSignOut();
      
    } catch (err) {
      console.error('登出過程中發生未預期的錯誤:', err);
      // 即使出錯也執行強制清理
      forceSignOut();
    }
  };

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link href="/" className="hover:underline">網址縮短器</Link>
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:underline">首頁</Link>
            </li>
            {session && (
              <>
                <li>
                  <Link href="/custom" className="hover:underline">自訂短網址</Link>
                </li>
                <li>
                  <Link href="/history" className="hover:underline">歷史記錄</Link>
                </li>
              </>
            )}
            <li>
              {session ? (
                <button 
                  onClick={handleSignOut} 
                  className="hover:underline"
                  title="點擊登出"
                >
                  登出（{session.user?.email || '用戶'}）
                </button>
              ) : (
                <button 
                  onClick={handleSignIn} 
                  className="hover:underline"
                >
                  Google 登入
                </button>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}