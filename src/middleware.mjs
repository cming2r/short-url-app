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
  
  console.log(`[Middleware] Processing request for path: ${pathname}`);
  
  // 處理靜態資源和 API 請求
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_shortcuts/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/manifest.json') ||
    pathname.includes('.') // 靜態文件通常有擴展名
  ) {
    console.log(`[Middleware] Skipping static resource: ${pathname}`);
    return NextResponse.next();
  }
  
  // 特殊處理 OAuth 回調 (處理 Google 登入的關鍵)
  if (pathname === '/' && (url.searchParams.has('code') || url.searchParams.has('error'))) {
    const locale = getLocale(request);
    console.log(`[Middleware] OAuth callback detected, redirecting to /${locale} with query params`);
    
    // 保留所有查詢參數
    const redirectUrl = new URL(`/${locale}`, request.url);
    url.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(redirectUrl);
  }
  
  // 處理根路徑 - 重定向到特定語言的首頁
  if (pathname === '/') {
    const locale = getLocale(request);
    console.log(`[Middleware] Redirecting / to /${locale}`);
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }
  
  // 處理可能被混淆的保留路徑
  if (pathname === '/privacy-policy' || pathname === '/terms' || pathname === '/custom' || pathname === '/history') {
    const locale = getLocale(request);
    console.log(`[Middleware] Redirecting ${pathname} to /${locale}${pathname}`);
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }
  
  // 處理 not-found 路徑 - 這是一個特殊頁面，不要視為短網址
  if (pathname === '/not-found') {
    console.log(`[Middleware] Letting Next.js handle the not-found page`);
    return NextResponse.next();
  }
  
  // 處理 /en 和 /tw 路徑
  if (pathname === '/en' || pathname === '/tw') {
    const locale = pathname.substring(1); // 移除前導斜線
    console.log(`[Middleware] Processing language homepage: ${pathname}`);
    return NextResponse.rewrite(new URL(`/${locale}`, request.url));
  }
  
  // 處理 /en/* 和 /tw/* 路徑
  if (pathname.startsWith('/en/') || pathname.startsWith('/tw/')) {
    const parts = pathname.split('/');
    const locale = parts[1]; // 'en' 或 'tw'
    const rest = parts.slice(2).join('/');
    console.log(`[Middleware] Processing localized route: /${locale}/${rest}`);
    return NextResponse.rewrite(new URL(`/${locale}/${rest}`, request.url));
  }
  
  // 確定完全匹配的路徑列表，這些不會視為短網址
  const PROTECTED_PATHS = [
    '/en', '/tw', 
    '/not-found', '/favicon.ico', '/manifest.json',
    '/privacy-policy', '/terms', '/custom', '/history',
    '/en/privacy-policy', '/en/terms', '/en/custom', '/en/history', '/en/not-found',
    '/tw/privacy-policy', '/tw/terms', '/tw/custom', '/tw/history', '/tw/not-found'
  ];
  
  if (PROTECTED_PATHS.includes(pathname)) {
    console.log(`[Middleware] Protected path: ${pathname}, letting Next.js handle it`);
    return NextResponse.next();
  }
  
  // 檢查是否可能是短碼
  // 提取潛在的短碼
  const shortCode = pathname.substring(1); // 移除前導斜線
  if (shortCode && shortCode.length > 0) {
    try {
      console.log(`[Middleware] Potential shortcode: ${shortCode}, processing...`);
      // 如果像是靜態文件，則跳過處理
      if (shortCode.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot)$/i)) {
        console.log(`[Middleware] ${shortCode} appears to be a static file, not processing as shortcode`);
        return NextResponse.next();
      }
      
      // 重寫到 _shortcuts 處理程序
      const shortcodeUrl = `/_shortcuts/${encodeURIComponent(shortCode)}`;
      console.log(`[Middleware] Forwarding to shortcode handler: ${shortcodeUrl}`);
      return NextResponse.rewrite(new URL(shortcodeUrl, request.url));
    } catch (error) {
      console.error(`[Middleware] Error processing shortcode: ${shortCode}`, error);
      return NextResponse.redirect(new URL('/not-found', request.url));
    }
  }
  
  // 其他請求直接通過
  console.log(`[Middleware] Unhandled path: ${pathname}, letting Next.js handle it`);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};