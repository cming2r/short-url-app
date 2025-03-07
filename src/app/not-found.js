import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { DEFAULT_LOCALE } from '@/lib/i18n/constants';

export default function NotFound() {
  // 從請求頭獲取 Accept-Language
  const headersList = headers();
  const acceptLanguage = headersList.get('Accept-Language') || '';
  
  // 簡單判斷語言，如果包含 zh 或 tw 則設定為繁體中文，否則設為英文
  const userLocale = acceptLanguage.includes('zh') ? 'tw' : 'en';
  
  // 重定向到對應語言的 not-found 頁面
  redirect(`/${userLocale}/not-found`);
}