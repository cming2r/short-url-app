'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import enTranslations from './en';
import twTranslations from './tw';
import { 
  SUPPORTED_LOCALES as locales,
  LOCALE_MAPPING as localeMapping,
  URL_LOCALE_MAPPING as urlLocaleMapping,
  LANGUAGE_NAMES as LANGUAGES
} from './constants';

// 語言翻譯對象
const translations = {
  'en': enTranslations,
  'zh-TW': twTranslations,
};

// 創建語言上下文
const LanguageContext = createContext(null);

// 語言提供者組件
export function LanguageProvider({ children }) {
  const pathname = usePathname();
  
  // 從路徑獲取語言代碼
  const getLocaleFromPath = () => {
    if (typeof pathname !== 'string') return null;
    
    const pathParts = pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const firstPart = pathParts[0].toLowerCase();
      if (firstPart === 'en' || firstPart === 'tw') {
        return firstPart;
      }
    }
    return null;
  };
  
  // 取得初始語言 - 嚴格依據路徑決定，默認英文
  const getInitialLanguage = () => {
    // 當前瀏覽器路徑
    const browserPath = typeof window !== 'undefined' ? window.location.pathname : '';
    console.log(`初始化語言 - 當前瀏覽器路徑: ${browserPath}`);
    
    // 嚴格檢測路徑，移除所有自動語言檢測
    if (browserPath === '/' || 
        browserPath === '/custom' || 
        browserPath === '/history' || 
        browserPath === '/privacy-policy' || 
        browserPath === '/terms') {
      console.log(`檢測到英文路徑: ${browserPath}, 強制使用英文`);
      if (typeof window !== 'undefined') {
        // 清除可能存在的語言偏好，防止後續自動轉址
        localStorage.removeItem('language');
      }
      return 'en';
    }
    
    // 只從路徑獲取語言
    const pathLocale = getLocaleFromPath();
    if (pathLocale && localeMapping[pathLocale]) {
      console.log(`檢測到路徑語言標記: ${pathLocale}`);
      return localeMapping[pathLocale];
    }
    
    // 默認為英文
    return 'en';
  };

  const [language, setLanguage] = useState('en'); // 預設英文
  const [translations_, setTranslations] = useState(translations['en']);
  
  // 初始化語言
  useEffect(() => {
    setLanguage(getInitialLanguage());
  }, []);
  
  // 當路徑變化時，根據路徑更新語言
  useEffect(() => {
    const pathLocale = getLocaleFromPath();
    if (pathLocale && localeMapping[pathLocale]) {
      const newLang = localeMapping[pathLocale];
      if (newLang !== language) {
        console.log(`根據路徑切換語言: ${pathname} -> ${newLang}`);
        setLanguage(newLang);
      }
    }
  }, [pathname, language]);

  // 直接根據路徑設置翻譯，不再保存到 localStorage
  useEffect(() => {
    // 設定初始翻譯
    const currentLang = getInitialLanguage();
    console.log(`根據路徑選擇翻譯: ${currentLang}`);
    setTranslations(translations[currentLang]);
    
    // 設置 HTML lang 屬性
    if (typeof window !== 'undefined') {
      document.documentElement.lang = currentLang === 'zh-TW' ? 'zh-TW' : 'en';
    }
  }, [pathname]);  // 只在路徑變化時更新

  // 語言切換函數 - 極簡版，不再保存 localStorage
  const changeLanguage = (lang) => {
    // 檢查是否為 URL 語言代碼，如果是則轉換為內部語言代碼
    const internalLang = localeMapping[lang] || lang;
    
    // 只進行語言切換，不執行額外操作
    if (translations[internalLang]) {
      console.log(`切換語言 (UI僅限): ${internalLang}`);
      setLanguage(internalLang);
    }
  };

  // 簡單獲取當前語言的 URL 路徑代碼，只根據路徑判斷
  const getUrlLocale = () => {
    // 檢查當前路徑
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      
      // 簡化判斷：只看路徑是否包含 /tw/
      if (currentPath === '/tw' || currentPath.startsWith('/tw/')) {
        return 'tw';
      }
      
      // 其他所有情況返回 'en'
      return 'en';
    }
    
    // 服務器端渲染時，使用當前語言設定
    return urlLocaleMapping[language] || 'en';
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage, 
      t: translations_,
      getUrlLocale 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 自定義 hook 以便在組件中使用翻譯
export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}