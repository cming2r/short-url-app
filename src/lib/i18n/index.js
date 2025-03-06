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
  
  // 從 localStorage 獲取保存的語言，如果沒有則檢測瀏覽器語言
  const getInitialLanguage = () => {
    // 首先嘗試從路徑獲取語言
    const pathLocale = getLocaleFromPath();
    if (pathLocale && localeMapping[pathLocale]) {
      return localeMapping[pathLocale];
    }
    
    if (typeof window === 'undefined') return 'zh-TW'; // 默認語言

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      return savedLanguage;
    }
    
    // 檢測瀏覽器語言
    const browserLanguage = navigator.language || navigator.userLanguage;
    
    // 根據瀏覽器語言選擇最接近的語言版本
    if (browserLanguage.startsWith('zh')) {
      return 'zh-TW';
    } else {
      return 'en'; // 默認為英文
    }
  };

  const [language, setLanguage] = useState('zh-TW'); // 預設繁體中文
  const [translations_, setTranslations] = useState(translations['zh-TW']);
  
  // 初始化語言
  useEffect(() => {
    setLanguage(getInitialLanguage());
  }, []);
  
  // 當路徑變化時更新語言
  useEffect(() => {
    const pathLocale = getLocaleFromPath();
    if (pathLocale && localeMapping[pathLocale]) {
      const newLang = localeMapping[pathLocale];
      if (newLang !== language) {
        setLanguage(newLang);
      }
    }
  }, [pathname, language]);

  // 當語言改變時更新翻譯
  useEffect(() => {
    setTranslations(translations[language]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
      // 設置 HTML lang 屬性
      document.documentElement.lang = language;
    }
  }, [language]);

  // 切換語言函數
  const changeLanguage = (lang) => {
    // 檢查是否為 URL 語言代碼，如果是則轉換為內部語言代碼
    const internalLang = localeMapping[lang] || lang;

    if (translations[internalLang]) {
      setLanguage(internalLang);
    }
  };

  // 獲取當前語言的 URL 路徑代碼
  const getUrlLocale = () => {
    return urlLocaleMapping[language] || 'tw'; // 默認為 tw
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