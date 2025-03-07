import { DEFAULT_LOCALE } from '@/lib/i18n/constants';

export async function generateMetadata({ params }) {
  // 在 Next.js 14+ 中，需要先 await params
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || DEFAULT_LOCALE;
  const isTW = locale === 'tw';
  
  return {
    // 設定語言特定的標題和描述
    title: isTW 
      ? '短網址產生器 - 快速建立短網址' 
      : 'URL Shortener - Create Short URLs Instantly',
    description: isTW 
      ? '免費短網址服務 - 建立簡短、易記的連結，重定向到您的原始網址。簡單、快速且可靠。' 
      : 'Free URL shortener service - Create short, memorable links that redirect to your original URL. Simple, fast and reliable.',
    
    // 覆蓋 OpenGraph 以使用正確的語言
    openGraph: {
      title: isTW 
        ? '短網址產生器 - 快速建立短網址' 
        : 'URL Shortener - Create Short URLs Instantly',
      description: isTW 
        ? '免費短網址服務 - 建立簡短、易記的連結，重定向到您的原始網址。簡單、快速且可靠。' 
        : 'Free URL shortener service - Create short, memorable links that redirect to your original URL. Simple, fast and reliable.',
      locale: isTW ? 'zh_TW' : 'en_US',
    },
    
    // 根據當前頁面設置替代語言連結
    alternates: {
      canonical: isTW 
        ? 'https://vvrl.cc/tw' // 繁體中文頁面的規範 URL
        : 'https://vvrl.cc/',  // 英文頁面的規範 URL
      languages: {
        'en': 'https://vvrl.cc/',
        'zh-TW': 'https://vvrl.cc/tw',
      },
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  // 透過 script 設置 HTML 的語言屬性
  // (根布局已經定義了 html 和 body 標籤，這裡我們只能修改子內容)
  // 在 Next.js 14+ 中，需要先 await params
  const resolvedParams = await params;
  const locale = resolvedParams?.locale || DEFAULT_LOCALE;
  const htmlLang = locale === 'tw' ? 'zh-TW' : 'en';
  
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang = "${htmlLang}";`
        }}
      />
      <div className="flex flex-col min-h-screen">
        {children}
      </div>
    </>
  );
}