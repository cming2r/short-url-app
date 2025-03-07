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
  
  // 取得初始語言 - 不再根據瀏覽器偏好自動切換
  const getInitialLanguage = () => {
    // 只從路徑獲取語言，忽略瀏覽器設定
    const pathLocale = getLocaleFromPath();
    if (pathLocale && localeMapping[pathLocale]) {
      return localeMapping[pathLocale];
    }
    
    // 不再檢測瀏覽器語言，而是直接使用預設英文
    return 'en';
  };

  const [language, setLanguage] = useState('en'); // 預設英文
  const [translations_, setTranslations] = useState(translations['en']);
  
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