import { NextResponse } from 'next/server';

// 支持的語言
const SUPPORTED_LOCALES = ['en', 'tw'];
// 取消自動語言偵測，所有用戶首頁默認英文
const DEFAULT_LOCALE = 'en';

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
  // 避免重定向OAuth回調，讓Supabase直接處理，防止redirect loop
  if (url.searchParams.has('code') || url.searchParams.has('error')) {
    console.log(`OAuth callback detected, letting Supabase handle it directly`);
    return NextResponse.next();
  }
  
  // 根路徑不需要重寫，直接顯示英文內容
  // 已在 /app/page.js 中實現直接顯示英文內容
  if (pathname === '/') {
    console.log(`Root path / directly displays English content`);
    return NextResponse.next();
  }
  
  // 處理 /en 路徑 - 重定向到根路徑
  if (pathname === '/en') {
    console.log(`Redirecting ${pathname} to root path (/) for English`);
    // 使用 301 永久重定向到根路徑
    return NextResponse.redirect(new URL('/', request.url), 301);
  }
  
  // 保留 /tw 路徑和所有 /tw/ 開頭的路徑，允許中文版本存在
  if (pathname === '/tw' || pathname.startsWith('/tw/')) {
    console.log(`Allowing Chinese path: ${pathname}`);
    return NextResponse.next();
  }
  
  // 不再處理 /[locale]/ 路徑的重定向
  
  // 特別捕獲直接的 /[locale]/ 請求 (這些應該無法通過分隔符匹配)
  if (pathname.startsWith('/[locale]/')) {
    const parts = pathname.split('/');
    const rest = parts.slice(2).join('/');
    console.log(`Redirecting special dynamic path ${pathname} to /${rest}`);
    return NextResponse.redirect(new URL(`/${rest}`, request.url), 301);
  }
  
  // 確保英文版頁面路徑保持不變，強制在主頁及直接訪問 /custom, /history 等時使用英文版
  if (pathname === '/custom' || pathname === '/history' || 
      pathname === '/privacy-policy' || pathname === '/terms') {
    console.log(`使用英文版頁面: ${pathname}`);
    return NextResponse.next();
  }
  
  // 特別處理: 從英文主頁導航到 /custom 和 /history
  const referer = request.headers.get('referer');
  if ((pathname === '/custom' || pathname === '/history') && 
      referer && (referer.endsWith('/') || referer.endsWith('localhost:3000'))) {
    console.log(`從主頁導航: ${referer} -> ${pathname}, 強制使用英文版`);
    return NextResponse.next();
  }

  // 專門為短網址格式添加檢測 (6-8字符的字母數字)
  const shortCodeRegex = /^\/[a-zA-Z0-9]{6,8}$/;
  if (shortCodeRegex.test(pathname)) {
    console.log(`[MIDDLEWARE] Detected potential shortcode format in path: ${pathname}`);
    // 提取潛在的短碼
    const shortCode = pathname.substring(1); // 移除前導斜線
    
    // 重寫到 _shortcuts 處理程序
    const shortcodeUrl = `/_shortcuts/${encodeURIComponent(shortCode)}`;
    console.log(`[MIDDLEWARE] Forwarding to shortcode handler: ${shortcodeUrl}`);
    return NextResponse.rewrite(new URL(shortcodeUrl, request.url));
  }
  
  // 原來的短碼處理邏輯保留為後備
  if (
    !pathname.startsWith('/en/') && 
    !pathname.startsWith('/tw/') && 
    !pathname.startsWith('/[locale]/') &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/_') &&
    !pathname.startsWith('/icons/') &&
    pathname !== '/en' && 
    pathname !== '/tw' && 
    pathname !== '/history' &&
    pathname !== '/custom' &&
    pathname !== '/privacy-policy' &&
    pathname !== '/terms' &&
    pathname !== '/favicon.ico' &&
    pathname !== '/manifest.json' &&
    pathname !== '/'
  ) {
    // 提取潛在的短碼
    const shortCode = pathname.substring(1); // 移除前導斜線
    if (shortCode && shortCode.length > 0) {
      try {
        console.log(`[MIDDLEWARE] Checking alternative shortcode: ${shortCode}`);
        // 如果像是靜態文件，則跳過處理
        if (shortCode.match(/\.(ico|png|jpg|jpeg|gif|svg|webp|css|js|woff|woff2|ttf|eot)$/i)) {
          console.log(`[MIDDLEWARE] ${shortCode} appears to be a static file, not processing as shortcode`);
          return NextResponse.next();
        }
        
        // 重寫到 _shortcuts 處理程序
        const shortcodeUrl = `/_shortcuts/${encodeURIComponent(shortCode)}`;
        console.log(`[MIDDLEWARE] Forwarding to shortcode handler: ${shortcodeUrl}`);
        return NextResponse.rewrite(new URL(shortcodeUrl, request.url));
      } catch (error) {
        console.error(`[MIDDLEWARE] Error processing shortcode: ${shortCode}`, error);
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