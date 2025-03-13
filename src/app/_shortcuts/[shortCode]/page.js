import { redirect } from 'next/navigation';
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
  
  try {
    // 直接將所有日誌輸出到瀏覽器控制台
    if (typeof window !== 'undefined') {
      console.log('Client-side: Short code handler activated for', shortCode);
    }
    
    // 首先嘗試查詢普通短網址
    let { data, error } = await supabase
      .from('urls')
      .select('original_url')
      .eq('short_code', shortCode)
      .single();
    
    // 如果普通短網址不存在，嘗試查詢自定義短網址
    if (error || !data) {
      console.log('Regular URL not found, checking custom URLs');
      const { data: customData, error: customError } = await supabase
        .from('custom_urls')
        .select('original_url')
        .eq('short_code', shortCode)
        .single();
      
      if (customError || !customData) {
        console.error('Short code not found in any table:', shortCode);
        return new Response(`<html><body><h1>404 - Short URL not found</h1><p>The short URL ${shortCode} does not exist.</p></body></html>`, {
          status: 404,
          headers: {
            'Content-Type': 'text/html',
          }
        });
      }
      
      // 更新自定義短網址的點擊計數器
      try {
        await supabase
          .from('custom_urls')
          .update({ 
            click_count: supabase.rpc('increment', { x: 1 }),
            last_clicked_at: new Date().toISOString()
          })
          .eq('short_code', shortCode);
      } catch (updateError) {
        console.error('Error updating click count:', updateError);
        // 繼續執行重定向，即使更新點擊次數失敗
      }
      
      console.log('Redirecting to custom URL:', customData.original_url);
      
      // 確保是有效的絕對 URL
      let targetUrl = customData.original_url;
      if (!targetUrl.startsWith('http')) {
        targetUrl = 'https://' + targetUrl;
      }
      
      // 使用基本的重定向響應
      return new Response(null, {
        status: 302,
        headers: {
          'Location': targetUrl,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }
    
    // 更新普通短網址的點擊計數器
    try {
      await supabase
        .from('urls')
        .update({ 
          click_count: supabase.rpc('increment', { x: 1 }),
          last_clicked_at: new Date().toISOString()
        })
        .eq('short_code', shortCode);
    } catch (updateError) {
      console.error('Error updating click count:', updateError);
      // 繼續執行重定向，即使更新點擊次數失敗
    }
    
    console.log('Redirecting to URL:', data.original_url);
    
    // 確保是有效的絕對 URL
    let targetUrl = data.original_url;
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }
    
    // 使用基本的重定向響應
    return new Response(null, {
      status: 302,
      headers: {
        'Location': targetUrl,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('Error processing redirect:', error);
    // 發生錯誤時顯示詳細錯誤頁面
    return new Response(`<html><body><h1>Error</h1><p>Failed to process short URL: ${error.message}</p></body></html>`, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      }
    });
  }
}