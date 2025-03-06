import { DEFAULT_LOCALE } from '@/lib/i18n/constants';
import ClientPage from './components/HomePage';

// 靜態生成英文和中文兩個版本
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'tw' }
  ];
}

// 使用 async 函數並正確 await params 參數
export default async function Page({ params }) {
  // 在 Next.js 15 中，需要 await params 才能訪問其屬性
  const resolvedParams = await params;
  const locale = String(resolvedParams.locale || DEFAULT_LOCALE);
  
  return <ClientPage locale={locale} />;
}