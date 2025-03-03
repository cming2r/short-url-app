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

  // 提供一個更強力的清除 Supabase 會話的方法
  const handleSignOut = async () => {
    try {
      console.log('嘗試登出前的會話狀態:', session ? '有會話' : '無會話');
      
      // 同時使用多種方法清除會話
      // 1. 先使用官方的登出方法嘗試 (忽略可能的錯誤)
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.log('標準登出方法失敗，繼續使用替代方法');
      }
      
      // 2. 手動清除 localStorage 中所有 Supabase 相關項目
      if (typeof window !== 'undefined') {
        console.log('開始清除本地存儲數據...');
        const keysToRemove = [];
        
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
        
        // 單獨循環刪除，避免在遍歷過程中修改集合
        keysToRemove.forEach(key => {
          console.log('清除 localStorage 項:', key);
          localStorage.removeItem(key);
        });
      }
      
      // 3. 清除所有 cookie
      if (typeof document !== 'undefined') {
        console.log('清除所有 cookies...');
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.trim().split("=")[0] + "=;expires=" + new Date(0).toUTCString() + ";path=/";
        });
      }
      
      // 4. 強制清除 Supabase 內部存儲狀態
      try {
        if (supabase.auth && typeof supabase.auth._removeSession === 'function') {
          supabase.auth._removeSession();
        }
      } catch (e) {
        console.log('清除 Supabase 內部會話失敗，繼續進行');
      }
      
      // 5. 重設 React 狀態
      setSession(null);
      console.log('React 狀態已重設');
      
      // 6. 使用替代頁面重新載入方式
      console.log('準備重新載入頁面...');
      
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          try {
            // 嘗試使用更徹底的頁面重新載入方式
            window.location.replace(window.location.origin + '?t=' + Date.now());
          } catch (e) {
            console.error('頁面重新載入失敗，使用備用方法');
            window.location.href = window.location.origin;
          }
        }
      }, 300); // 給足夠時間完成清理工作
      
    } catch (error) {
      console.error('登出過程中出錯:', error);
      
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