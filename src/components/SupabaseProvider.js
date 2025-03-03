'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function SupabaseProvider({ children }) {
  useEffect(() => {
    // 監聽認證狀態變化
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in provider:', event);
      
      // 如果有錯誤的重定向 URL，可以在這裡檢測並處理
      if (event === 'SIGNED_IN' && window.location.href.includes('short-url-app-olive.vercel.app')) {
        console.log('檢測到生產環境 URL，將重定向到本地開發環境');
        // 獲取當前的查詢參數並保留
        const params = new URLSearchParams(window.location.search);
        // 重定向到本地環境
        window.location.href = `http://localhost:3000/?${params.toString()}`;
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return children;
}