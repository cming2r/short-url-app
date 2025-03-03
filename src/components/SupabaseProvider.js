'use client';

import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
      console.log('SupabaseProvider 清理中...');
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 提供一個清除 Supabase 會話的方法
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('從 Provider 成功登出');
      window.location.reload(); // 確保完全重新載入
    } catch (error) {
      console.error('從 Provider 登出時出錯:', error);
    }
  };

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