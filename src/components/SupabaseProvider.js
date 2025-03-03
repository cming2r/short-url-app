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
      // 先檢查是否有會話
      console.log('嘗試登出前的會話狀態:', session ? '有會話' : '無會話');
      
      // 即使沒有會話也嘗試登出
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('常規登出方法出錯:', error);
        // 如果是會話不存在的錯誤，使用替代方法
        if (error.message.includes('session missing') || error.message.includes('missing')) {
          console.log('嘗試替代登出方法...');
          // 直接清除本地存儲中的會話
          if (typeof window !== 'undefined') {
            // 清除所有的 supabase 存儲
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('supabase.auth')) {
                console.log('清除存儲項:', key);
                localStorage.removeItem(key);
              }
            }
            // 清除可能相關的 cookie
            document.cookie.split(";").forEach(function(c) {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            console.log('已清除本地存儲和 Cookie');
          }
        } else {
          throw error;
        }
      }
      
      // 無論如何都嘗試重新載入頁面
      console.log('從 Provider 完成登出處理，重新載入頁面');
      
      // 使用更強力的頁面重新載入
      if (typeof window !== 'undefined') {
        // 先清除會話狀態
        setSession(null);
        // 設定一個短暫延遲再重新載入，確保狀態已經清除
        setTimeout(() => {
          window.location.href = window.location.origin;
        }, 100);
      }
    } catch (error) {
      console.error('從 Provider 登出時出錯:', error);
      
      // 即使出錯也重設狀態並重新載入
      setSession(null);
      if (typeof window !== 'undefined') {
        window.location.href = window.location.origin;
      }
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