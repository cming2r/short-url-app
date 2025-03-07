import { NextResponse } from 'next/server';

// 支持的語言和默認語言
const SUPPORTED_LOCALES = ['en', 'tw'];
const DEFAULT_LOCALE = 'tw';

// 獲取用戶偏好語言
function getLocale(request) {
  // 獲取 Accept-Language 頭
  const acceptLanguage = request.headers.get('accept-language') || '';
  const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim().toLowerCase());
  
  // 根據 Accept-Language 確定最佳匹配語言
  let locale = DEFAULT_LOCALE; // 默認為繁體中文
  
  for (const lang of languages) {
    if (lang.startsWith('zh-tw') || lang.startsWith('zh-hk') || lang.startsWith('zh')) {
      locale = 'tw';
      break;
    } else if (lang.startsWith('en')) {
      locale = 'en';
      break;
    }
  }
  
  return locale;
}

export function middleware(request) {
  // 獲取完整 URL 以處理查詢參數
  const url = new URL(request.url);
  const { pathname } = url;
  
  // 定義應用中的所有有效路徑
  const LANGUAGE_CODES = ['en', 'tw'];
  const APP_ROUTES = ['privacy-policy', 'terms', 'custom', 'history', 'not-found'];
  
  // 處理靜態資源和 API 請求 - 讓它們直接通過
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_shortcuts/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/manifest.json') ||
    pathname.includes('.') // 靜態文件通常有擴展名
  ) {
    return NextResponse.next();
  }
  
  // 特殊處理 OAuth 回調 
  if (pathname === '/' && (url.searchParams.has('code') || url.searchParams.has('error'))) {
    const locale = getLocale(request);
    console.log(`OAuth callback detected, redirecting to /${locale} with query params`);
    
    // 保留所有查詢參數
    const redirectUrl = new URL(`/${locale}`, request.url);
    url.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(redirectUrl);
  }
  
  // 步驟 1: 處理根路徑 - 重定向到特定語言的首頁
  if (pathname === '/') {
    const locale = getLocale(request);
    console.log(`Redirecting / to /${locale}`);
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }
  
  // 步驟 2: 處理 /en 和 /tw 路徑 (語言首頁)
  const pathParts = pathname.split('/').filter(Boolean);
  if (pathParts.length === 1 && LANGUAGE_CODES.includes(pathParts[0])) {
    console.log(`Processing language homepage: ${pathname}`);
    return NextResponse.rewrite(new URL(`/${pathParts[0]}`, request.url));
  }
  
  // 步驟 3: 處理 /en/* 和 /tw/* 路徑 (語言子頁面)
  if (
    pathParts.length >= 2 && 
    LANGUAGE_CODES.includes(pathParts[0]) && 
    (APP_ROUTES.includes(pathParts[1]) || pathParts[1].length > 0)
  ) {
    const locale = pathParts[0];
    const rest = pathParts.slice(1).join('/');
    console.log(`Processing localized route: /${locale}/${rest}`);
    return NextResponse.rewrite(new URL(`/${locale}/${rest}`, request.url));
  }
  
  // 步驟 4: 處理未本地化的應用路徑 (如 /privacy-policy → /en/privacy-policy)
  if (pathParts.length === 1 && APP_ROUTES.includes(pathParts[0])) {
    const locale = getLocale(request);
    console.log(`Redirecting ${pathname} to /${locale}${pathname}`);
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }
  
  // 步驟 5: 檢查是否有可能是短網址碼
  // 如果不是以上任何模式，且不是明確的系統路徑，則當作短網址處理
  if (pathParts.length === 1 && pathParts[0].length > 0) {
    const shortCode = pathParts[0];
    
    // 特殊情況: 過濾靜態文件
    if (shortCode.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot)$/i)) {
      console.log(`${shortCode} appears to be a static file, not processing as shortcode`);
      return NextResponse.next();
    }
    
    try {
      console.log(`Processing potential shortcode: ${shortCode}`);
      // 重寫到 _shortcuts 處理程序
      return NextResponse.rewrite(new URL(`/_shortcuts/${encodeURIComponent(shortCode)}`, request.url));
    } catch (error) {
      console.error(`Error processing shortcode: ${shortCode}`, error);
      // 顯示 404 頁面而不是重定向
      return NextResponse.next();
    }
  }
  
  // 所有其他情況，讓 Next.js 正常處理 (可能會顯示 404)
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};