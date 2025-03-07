import { redirect, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// 檢查這是否是語言代碼 (en/tw)
function isLocaleCode(code) {
  return code === 'en' || code === 'tw';
}

export default async function ShortCodeHandler({ params }) {
  // Get the shortCode from params - properly await params in Next.js 15
  const resolvedParams = await params;
  const shortCode = resolvedParams?.shortCode || '';
  console.log('[SHORTCUTS] ShortCodeHandler activated');
  console.log('[SHORTCUTS] Processing shortCode:', shortCode);
  console.log('[SHORTCUTS] Raw params:', JSON.stringify(resolvedParams));
  
  // For language routes, this should never be reached because we have explicit routes
  // but just in case, redirect appropriately
  if (isLocaleCode(shortCode)) {
    console.log(`[SHORTCUTS] ${shortCode} is a locale code, redirecting`);
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `/${shortCode}`,
      },
    });
  }
  
  // 特殊處理 not-found 路徑，避免循環重定向
  if (shortCode === 'not-found') {
    console.log(`[SHORTCUTS] Handling /not-found path, showing 404 page`);
    notFound();
  }
  
  // 查詢數據庫獲取原始 URL
  try {
    console.log(`[Server] Looking up shortcode in database: ${shortCode}`);
    
    // 首先嘗試查詢普通短網址
    let { data, error } = await supabase
      .from('urls')
      .select('original_url')
      .eq('short_code', shortCode)
      .single();
    
    // 如果普通短網址不存在，嘗試查詢自定義短網址
    if (error || !data) {
      const { data: customData, error: customError } = await supabase
        .from('custom_urls')
        .select('original_url')
        .eq('short_code', shortCode)
        .single();
      
      if (customError || !customData) {
        console.error('[Server] Short code not found in any table:', shortCode);
        // 顯示404頁面，不做重定向
        notFound();
      }
      
      // 更新自定義短網址的點擊計數器
      await supabase
        .from('custom_urls')
        .update({ click_count: supabase.rpc('increment', { x: 1 }) })
        .eq('short_code', shortCode);
      
      console.log(`[Server] Redirecting to custom URL: ${customData.original_url}`);
      
      // 確保是有效的絕對 URL
      let targetUrl = customData.original_url;
      try {
        // 檢查是否為有效 URL
        new URL(targetUrl);
        console.log('[SHORTCUTS] Redirecting to valid URL:', targetUrl);
        // 使用客戶端重定向而非Next.js的redirect函數
        return new Response(null, {
          status: 302,
          headers: {
            'Location': targetUrl,
          },
        });
      } catch (e) {
        // 不是有效 URL，添加協議
        console.error('[SHORTCUTS] Invalid URL format, trying to add protocol:', targetUrl);
        targetUrl = 'https://' + targetUrl;
        console.log('[SHORTCUTS] Redirecting to URL with added protocol:', targetUrl);
        // 使用客戶端重定向而非Next.js的redirect函數
        return new Response(null, {
          status: 302,
          headers: {
            'Location': targetUrl,
          },
        });
      }
    }
    
    // 更新普通短網址的點擊計數器
    await supabase
      .from('urls')
      .update({ click_count: supabase.rpc('increment', { x: 1 }) })
      .eq('short_code', shortCode);
    
    console.log(`[Server] Redirecting to URL: ${data.original_url}`);
    
    // 確保是有效的絕對 URL
    let targetUrl = data.original_url;
    try {
      // 檢查是否為有效 URL
      new URL(targetUrl);
      console.log('[SHORTCUTS] Redirecting to valid URL:', targetUrl);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': targetUrl,
        },
      });
    } catch (e) {
      // 不是有效 URL，添加協議
      console.error('[SHORTCUTS] Invalid URL format, trying to add protocol:', targetUrl);
      targetUrl = 'https://' + targetUrl;
      console.log('[SHORTCUTS] Redirecting to URL with added protocol:', targetUrl);
      return new Response(null, {
        status: 302,
        headers: {
          'Location': targetUrl,
        },
      });
    }
    
  } catch (error) {
    console.error('[SHORTCUTS] Error processing redirect:', error);
    // 顯示404頁面，不做重定向
    
    // 創建一個簡單的HTML來顯示錯誤信息
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Short URL Error</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>短網址處理時出錯</h1>
          <p>無法找到對應的原始URL: ${shortCode}</p>
          <p>錯誤: ${error.message}</p>
          <p><a href="/">返回首頁</a></p>
        </body>
      </html>
    `;
    
    return new Response(htmlContent, {
      status: 404,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}