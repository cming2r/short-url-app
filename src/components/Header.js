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
    console.log('嘗試登出...');
    try {
      // 優先使用上下文中的登出方法
      if (supabaseContext && supabaseContext.signOut) {
        console.log('使用 SupabaseContext 的 signOut 方法');
        await supabaseContext.signOut();
      } else {
        // 回退到直接使用 Supabase
        console.log('直接使用 Supabase 登出');
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error('Supabase 登出錯誤:', error);
            // 如果是會話不存在的錯誤，使用替代方法
            if (error.message.includes('session missing') || error.message.includes('missing')) {
              console.log('嘗試 Header 中的替代登出方法...');
              // 手動清除存儲
              if (typeof window !== 'undefined') {
                // 清除 localStorage 中所有的 Supabase 相關項目
                for (let i = 0; i < localStorage.length; i++) {
                  const key = localStorage.key(i);
                  if (key && key.startsWith('supabase.auth')) {
                    console.log('從 Header 清除存儲項:', key);
                    localStorage.removeItem(key);
                  }
                }
              }
            }
          }
        } catch (innerError) {
          console.error('Supabase API 調用出錯:', innerError);
        }
        
        // 無論登出是否成功，都強制重新載入
        console.log('強制頁面重新載入');
        // 將會話狀態設置為 null
        setSession(null);
        
        // 延遲重載以確保狀態更新
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            // 使用完整 URL 重新載入，避免任何緩存問題
            window.location.href = window.location.origin + '?t=' + new Date().getTime();
          }
        }, 100);
      }
    } catch (err) {
      console.error('登出過程中發生未預期的錯誤:', err);
      console.log('即使出錯也嘗試重新載入');
      
      // 強制重設頁面狀態
      setSession(null);
      if (typeof window !== 'undefined') {
        window.location.href = window.location.origin;
      }
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
                  // 添加額外的直接登出方法作為後備
                  onDoubleClick={() => {
                    console.log('使用直接登出方法');
                    // 直接清除所有相關存儲並重新載入
                    if (typeof window !== 'undefined') {
                      // 清除 localStorage
                      try {
                        for (let i = 0; i < localStorage.length; i++) {
                          const key = localStorage.key(i);
                          if (key && key.startsWith('supabase.auth')) {
                            localStorage.removeItem(key);
                          }
                        }
                      } catch (e) {
                        console.error('清除 localStorage 出錯:', e);
                      }
                      // 強制重新載入
                      window.location.href = window.location.origin;
                    }
                  }}
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