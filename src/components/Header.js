'use client';

import { useState, useEffect, useContext } from 'react';
import { supabase, getCurrentSiteUrl } from '@/lib/supabase';
import Link from 'next/link';
import { SupabaseContext } from './SupabaseProvider';

export default function Header() {
  // 使用來自 SupabaseProvider 的會話狀態
  const supabaseContext = useContext(SupabaseContext);
  const [session, setSession] = useState(null);
  
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
    
    if (error) console.error('登入錯誤:', error);
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