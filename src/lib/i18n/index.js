'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from './en';
import zhTWTranslations from './zh-TW';
import zhCNTranslations from './zh-CN';

// 語言翻譯對象
const translations = {
  'en': enTranslations,
  'zh-TW': zhTWTranslations,
  'zh-CN': zhCNTranslations,
};

// 語言名稱對照表
export const LANGUAGES = {
  'en': 'English',
  'zh-TW': '繁體中文',
  'zh-CN': '简体中文',
};

// 創建語言上下文
const LanguageContext = createContext(null);

// 語言提供者組件
export function LanguageProvider({ children }) {
  // 從 localStorage 獲取保存的語言，如果沒有則檢測瀏覽器語言
  const getInitialLanguage = () => {
    if (typeof window === 'undefined') return 'zh-TW'; // 默認語言

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && translations[savedLanguage]) {
      return savedLanguage;
    }
    
    // 檢測瀏覽器語言
    const browserLanguage = navigator.language || navigator.userLanguage;
    
    // 根據瀏覽器語言選擇最接近的語言版本
    if (browserLanguage.startsWith('zh-TW') || browserLanguage.startsWith('zh-HK')) {
      return 'zh-TW';
    } else if (browserLanguage.startsWith('zh')) {
      return 'zh-CN';
    } else {
      return 'en'; // 默認為英文
    }
  };

  const [language, setLanguage] = useState('zh-TW'); // 預設繁體中文
  const [translations_, setTranslations] = useState(translations['zh-TW']);
  
  // 監聽瀏覽器語言變化
  useEffect(() => {
    setLanguage(getInitialLanguage());
  }, []);

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
    if (translations[lang]) {
      setLanguage(lang);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t: translations_ }}>
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

// 語言選擇器組件
export function LanguageSelector() {
  const { language, changeLanguage } = useTranslation();
  
  return (
    <div className="flex items-center space-x-2">
      {Object.entries(LANGUAGES).map(([code, name]) => (
        <button
          key={code}
          onClick={() => changeLanguage(code)}
          className={`px-2 py-1 text-sm rounded ${
            language === code 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          } transition-colors`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}