import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 檢查是否在瀏覽器環境中
const isBrowser = typeof window !== 'undefined';

// 在瀏覽器環境中安全檢查 URL 參數
const hasCodeParam = isBrowser ? 
  (() => {
    try {
      return new URL(window.location.href).searchParams.has('code');
    } catch (e) {
      console.error('解析 URL 時出錯:', e);
      return false;
    }
  })() 
  : false;

// 使用基本配置創建 Supabase 客戶端
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true, // 確保這個設為 true 以自動檢測 URL 中的會話
    flowType: 'pkce', // 使用 PKCE 流程
    debug: isBrowser && (hasCodeParam || localStorage.getItem('authInProgress') === 'true'), // 在 OAuth 回調時啟用調試
  },
  global: {
    headers: {
      'Accept': 'application/json',
    },
  },
});

// 獲取當前站點 URL 的輔助函數
export const getCurrentSiteUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

/**
 * 清除所有 Supabase 相關的本地存儲項
 */
export const clearSupabaseStorage = () => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  
  try {
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
    
    // 然後再刪除
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('無法清除 localStorage 項:', key, e);
      }
    });
    
    return true;
  } catch (error) {
    console.error('清除 localStorage 出錯:', error);
    return false;
  }
};

/**
 * 清除所有 cookies
 */
export const clearAllCookies = () => {
  if (typeof document === 'undefined' || !document.cookie) {
    return;
  }
  
  try {
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
    return true;
  } catch (error) {
    console.error('清除 cookies 出錯:', error);
    return false;
  }
};

/**
 * 執行完整的登出操作
 * @param {Function} callback - 登出後的回調函數
 */
export const performFullSignOut = async (callback) => {
  console.log('執行完整登出操作...');
  
  // 1. 嘗試標準登出方法
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.warn('標準登出方法失敗，繼續清理:', error);
  }
  
  // 2. 清除本地存儲和 cookie
  clearSupabaseStorage();
  clearAllCookies();
  
  // 3. 可選: 執行回調
  if (typeof callback === 'function') {
    try {
      callback();
    } catch (error) {
      console.error('登出回調執行出錯:', error);
    }
  }
  
  // 4. 重新載入頁面 (如果沒有回調)
  if (typeof callback !== 'function' && typeof window !== 'undefined') {
    setTimeout(() => {
      const cacheBuster = new Date().getTime();
      window.location.replace(`${window.location.origin}?refresh=${cacheBuster}`);
    }, 200);
  }
};