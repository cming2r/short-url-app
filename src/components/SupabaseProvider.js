'use client';

import React, { createContext, useState, useEffect } from 'react';
import { supabase, performFullSignOut } from '@/lib/supabase';

// 創建一個上下文來共享 Supabase 和會話狀態
export const SupabaseContext = createContext(null);

export function SupabaseProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // 使用useEffect來確保水合完成
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log('SupabaseProvider 初始化中...');
    
    // 檢查是否從認證流程返回
    const isBrowser = typeof window !== 'undefined';
    const isAuthReturn = isBrowser && localStorage.getItem('authInProgress') === 'true';
    
    // 檢查是否有 OAuth 回調代碼
    const url = isBrowser ? new URL(window.location.href) : null;
    const hasCodeParam = url && url.searchParams.has('code');
    
    console.log('認證狀態檢查:', { isAuthReturn, hasCodeParam });
    
    if (isBrowser && hasCodeParam) {
      // 如果檢測到 code 參數，標記認證流程正在進行
      console.log('檢測到 OAuth 回調代碼 - 標記認證流程');
      localStorage.setItem('authInProgress', 'true');
      
      // 保存當前路徑（不帶查詢參數）用於重定向
      if (!localStorage.getItem('authStartPath')) {
        const pathWithoutQuery = window.location.pathname;
        localStorage.setItem('authStartPath', pathWithoutQuery);
        console.log('保存重定向路徑:', pathWithoutQuery);
      }
    }
    
    // 載入初始會話
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('獲取會話時出錯:', error);
      }
      
      console.log('初始會話載入:', session ? '已登入' : '未登入');
      setSession(session);
      setLoading(false);
      
      // 如果是從認證流程返回且已經有會話或有回調代碼，執行特殊處理
      if ((isAuthReturn || hasCodeParam) && session) {
        console.log('從認證流程返回，已有會話，處理頁面更新');
        // 立即清除認證標記，防止重複處理
        localStorage.removeItem('authInProgress');
        
        try {
          // 處理 URL 清理 - 刪除 code 和 error 參數，但保留當前路徑
          if (hasCodeParam && isBrowser) {
            console.log('清理 URL 中的認證參數');
            const cleanUrl = new URL(window.location.href);
            cleanUrl.searchParams.delete('code');
            cleanUrl.searchParams.delete('error');
            // 使用 replaceState 而不是 reload，避免刷新循環
            window.history.replaceState({}, '', cleanUrl.toString());
          }
          
          // 獲取保存的原始路徑，如果存在則恢復，但避免導致循環
          const savedPath = localStorage.getItem('authStartPath');
          
          // 只有在有保存路徑且與當前路徑不同時才恢復
          if (savedPath && isBrowser && window.location.pathname !== savedPath) {
            console.log('檢測到保存的原始路徑:', savedPath);
            localStorage.removeItem('authStartPath'); // 立即清除，防止重複處理
            
            // 關鍵改進：檢查是否已經處於正確的路徑
            // 如果當前路徑包含 "code=" 查詢參數但路徑正確，則不需要跳轉
            const currentPathWithoutQuery = window.location.pathname;
            
            if (currentPathWithoutQuery !== savedPath) {
              console.log('恢復到原始路徑 (無重載):', savedPath);
              
              // 使用 replaceState 而非 location.href，避免觸發整頁重載
              window.history.replaceState(
                {}, 
                '', 
                savedPath
              );
            } else {
              console.log('當前路徑已經正確，不需要跳轉');
            }
          } else {
            console.log('無需恢復路徑或路徑已正確');
            localStorage.removeItem('authStartPath');
          }
        } catch (error) {
          console.error('處理認證重定向時出錯:', error);
          // 出錯時清理所有標記，確保不會陷入循環
          localStorage.removeItem('authInProgress');
          localStorage.removeItem('authStartPath');
        }
      }
    }).catch(error => {
      console.error('載入會話時出錯:', error);
      setLoading(false);
    });

    // 監聽認證狀態變化
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('認證狀態變更:', event, session ? '已登入' : '未登入');
      
      const isBrowser = typeof window !== 'undefined';
      const url = isBrowser ? new URL(window.location.href) : null;
      const hasCodeParam = url && url.searchParams.has('code');
      const isAuthInProgress = isBrowser && localStorage.getItem('authInProgress') === 'true';
      
      // 記錄詳細的認證狀態
      console.log('認證事件詳情:', { 
        event, 
        hasSession: Boolean(session), 
        hasCodeParam, 
        isAuthInProgress 
      });
      
      // 處理各種認證事件
      switch (event) {
        case 'SIGNED_IN':
          console.log('用戶成功登入');
          setSession(session);
          
          // 如果有認證流程標記或 code 參數，需要處理回調流程
          if (isBrowser && (isAuthInProgress || hasCodeParam)) {
            handleAuthCallback(hasCodeParam, isAuthInProgress);
          }
          break;
          
        case 'TOKEN_REFRESHED':
          console.log('令牌已刷新');
          setSession(session);
          break;
          
        case 'SIGNED_OUT':
          console.log('用戶已登出');
          setSession(null);
          break;
          
        case 'USER_UPDATED':
          console.log('用戶資料已更新');
          setSession(session);
          break;
          
        default:
          // 其他事件，直接更新會話
          setSession(session);
      }
    });
    
    // 處理認證回調的函數
    function handleAuthCallback(hasCodeParam, isAuthInProgress) {
      console.log('處理登入回調流程...');
      
      // 清除認證流程標記
      localStorage.removeItem('authInProgress');
      const savedPath = localStorage.getItem('authStartPath');
      
      // 輕量處理，避免重定向循環
      setTimeout(() => {
        // 清除 URL 中的 code 參數
        if (hasCodeParam) {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('code');
          cleanUrl.searchParams.delete('error');
          window.history.replaceState({}, '', cleanUrl.toString());
        }
        
        if (savedPath) {
          console.log('從認證回調恢復到路徑:', savedPath);
          localStorage.removeItem('authStartPath');
          
          // 使用history API替換URL，避免重定向
          if (window.location.pathname !== savedPath) {
            console.log('使用history.replaceState切換到:', savedPath);
            window.history.replaceState({}, '', savedPath);
          }
          // 不再調用reload，避免重定向循環
        }
        // 不再重載頁面，避免重定向循環
      }, 100);
    }

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
    isClient
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}