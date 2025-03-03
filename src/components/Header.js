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
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error('登出錯誤:', error);
          alert('登出失敗: ' + error.message);
        } else {
          console.log('成功登出');
          // 強制刷新頁面以確保狀態更新
          window.location.href = window.location.origin;
        }
      }
    } catch (err) {
      console.error('登出過程中發生未預期的錯誤:', err);
      alert('登出時發生錯誤: ' + err.message);
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