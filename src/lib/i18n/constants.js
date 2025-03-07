// 這個檔案包含了靜態常數，可以在 Server Component 中安全使用

// 支持的語言列表
export const SUPPORTED_LOCALES = ['en', 'tw'];

// 默認語言 (始終為英文)
export const DEFAULT_LOCALE = 'en';

// 將 URL 語言路徑映射到內部語言代碼
export const LOCALE_MAPPING = {
  'en': 'en',
  'tw': 'zh-TW',
};

// URL 路徑映射到內部語言代碼的反向映射
export const URL_LOCALE_MAPPING = {
  'en': 'en',
  'zh-TW': 'tw',
};

// 語言名稱對照表
export const LANGUAGE_NAMES = {
  'en': 'English',
  'zh-TW': '中文',
};