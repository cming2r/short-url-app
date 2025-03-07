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
  
  // 處理靜態資源和 API 請求
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
  
  // 特殊處理 OAuth 回調 (處理 Google 登入的關鍵)
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
  
  // 根路徑不需要重寫，直接顯示英文內容
  // 已在 /app/page.js 中實現直接顯示英文內容
  if (pathname === '/') {
    console.log(`Root path / directly displays English content`);
    return NextResponse.next();
  }
  
  // 處理 /en 路徑 (重定向到根路徑) 和 /tw 路徑
  if (pathname === '/en') {
    console.log(`Redirecting /en to root path (/) for canonical URL structure`);
    // 使用 301 永久重定向到根路徑
    return NextResponse.redirect(new URL('/', request.url), 301);
  } else if (pathname === '/tw') {
    const locale = pathname.substring(1); // 移除前導斜線
    console.log(`Rewriting ${pathname} to use parameterized route`);
    return NextResponse.rewrite(new URL(`/${locale}`, request.url));
  }
  
  // 處理 /en/* 和 /tw/* 路徑
  if (pathname.startsWith('/en/')) {
    // 對於 /en/* 路徑，我們應該將其重定向到 /* 路徑（除了特殊頁面）
    const parts = pathname.split('/');
    const rest = parts.slice(2).join('/');
    
    // 不重定向特殊頁面，如果需要這些頁面存在於 /en/ 路徑下
    if (rest === 'privacy-policy' || rest === 'terms') {
      console.log(`Rewriting ${pathname} to use parameterized route for special page`);
      return NextResponse.rewrite(new URL(`/en/${rest}`, request.url));
    }
    
    console.log(`Redirecting ${pathname} to /${rest} for canonical URL structure`);
    return NextResponse.redirect(new URL(`/${rest}`, request.url), 301);
  } else if (pathname.startsWith('/tw/')) {
    const parts = pathname.split('/');
    const locale = parts[1]; // 'tw'
    const rest = parts.slice(2).join('/');
    console.log(`Rewriting ${pathname} to use parameterized route`);
    return NextResponse.rewrite(new URL(`/${locale}/${rest}`, request.url));
  }
  
  // 處理 privacy-policy 和 terms 路徑
  if (pathname === '/privacy-policy' || pathname === '/terms') {
    const locale = getLocale(request);
    console.log(`Redirecting ${pathname} to /${locale}${pathname}`);
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }
  
  // 檢查是否可能是短碼（不是以已知路徑開頭）
  if (
    !pathname.startsWith('/en/') && 
    !pathname.startsWith('/tw/') && 
    !pathname.startsWith('/[locale]/') &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/_') &&
    !pathname.startsWith('/icons/') &&
    pathname !== '/en' && 
    pathname !== '/tw' && 
    pathname !== '/favicon.ico' &&
    pathname !== '/manifest.json'
  ) {
    // 提取潛在的短碼
    const shortCode = pathname.substring(1); // 移除前導斜線
    if (shortCode && shortCode.length > 0) {
      try {
        console.log(`Potential shortcode: ${shortCode}, processing...`);
        // 如果像是靜態文件，則跳過處理
        if (shortCode.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot)$/i)) {
          console.log(`${shortCode} appears to be a static file, not processing as shortcode`);
          return NextResponse.next();
        }
        
        // 重寫到 _shortcuts 處理程序
        const shortcodeUrl = `/_shortcuts/${encodeURIComponent(shortCode)}`;
        console.log(`Forwarding to shortcode handler: ${shortcodeUrl}`);
        return NextResponse.rewrite(new URL(shortcodeUrl, request.url));
      } catch (error) {
        console.error(`Error processing shortcode: ${shortCode}`, error);
        // 直接讓 Next.js 處理，將顯示 404 頁面
        return NextResponse.next();
      }
    }
  }
  
  // 其他請求直接通過
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};