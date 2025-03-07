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
  console.log('[Server] Processing shortCode:', shortCode);
  
  // For language routes, this should never be reached because we have explicit routes
  // but just in case, redirect appropriately
  if (isLocaleCode(shortCode)) {
    console.log(`[Server] ${shortCode} is a locale code, redirecting`);
    redirect(`/${shortCode}`);
  }
  
  // 查詢數據庫獲取原始 URL
  try {
    console.log(`[Server] Looking up shortcode in database: ${shortCode}`);
    
    // 首先嘗試查詢普通短網址
    let { data, error } = await supabase
      .from('urls')
      .select('long_url')
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
        // 重定向到英文首頁
        redirect('/en');
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
        redirect(targetUrl);
      } catch (e) {
        // 不是有效 URL，添加協議
        console.error('[Server] Invalid URL format, trying to add protocol:', targetUrl);
        targetUrl = 'https://' + targetUrl;
        redirect(targetUrl);
      }
    }
    
    // 更新普通短網址的點擊計數器
    await supabase
      .from('urls')
      .update({ click_count: supabase.rpc('increment', { x: 1 }) })
      .eq('short_code', shortCode);
    
    console.log(`[Server] Redirecting to URL: ${data.long_url}`);
    
    // 確保是有效的絕對 URL
    let targetUrl = data.long_url;
    try {
      // 檢查是否為有效 URL
      new URL(targetUrl);
      redirect(targetUrl);
    } catch (e) {
      // 不是有效 URL，添加協議
      console.error('[Server] Invalid URL format, trying to add protocol:', targetUrl);
      targetUrl = 'https://' + targetUrl;
      redirect(targetUrl);
    }
    
  } catch (error) {
    console.error('[Server] Error processing redirect:', error);
    // 重定向到英文首頁
    redirect('/en');
  }
}