'use client';

import React, { createContext, useState, useEffect } from 'react';
import { supabase, performFullSignOut } from '@/lib/supabase';

// 創建一個上下文來共享 Supabase 和會話狀態
export const SupabaseContext = createContext(null);

export function SupabaseProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('SupabaseProvider 初始化中...');
    
    // 載入初始會話
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('初始會話載入:', session ? '已登入' : '未登入');
      setSession(session);
      setLoading(false);
    }).catch(error => {
      console.error('載入會話時出錯:', error);
      setLoading(false);
    });

    // 監聽認證狀態變化
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('認證狀態變更:', event, session ? '已登入' : '未登入');
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 處理登出的包裝函數
  const handleSignOut = async () => {
    // 重設本地狀態
    setSession(null);
    
    // 執行完整登出並在完成後重新載入頁面
    await performFullSignOut(() => {
      if (typeof window !== 'undefined') {
        const cacheBuster = new Date().getTime();
        window.location.replace(`${window.location.origin}?refresh=${cacheBuster}`);
      }
    });
  };

  // 提供給上下文的值
  const value = {
    session,
    signOut: handleSignOut,
    isLoading: loading,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}