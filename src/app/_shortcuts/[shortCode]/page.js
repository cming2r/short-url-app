import { redirect, notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// 檢查這是否是語言代碼或保留路徑 (en/tw)
const RESERVED_PATHS = ['en', 'tw', 'privacy-policy', 'terms', 'custom', 'history', 'not-found'];
function isReservedPath(code) {
  return RESERVED_PATHS.includes(code);
}

export default async function ShortCodeHandler({ params }) {
  // Get the shortCode from params - properly await params in Next.js 15
  const resolvedParams = await params;
  const shortCode = resolvedParams?.shortCode || '';
  console.log('[Server] Processing shortCode:', shortCode);
  
  // For reserved paths, including language routes, redirect appropriately
  if (isReservedPath(shortCode)) {
    console.log(`[Server] ${shortCode} is a reserved path, redirecting`);
    
    // 如果是語言代碼，直接重定向到該語言的首頁
    if (shortCode === 'en' || shortCode === 'tw') {
      redirect(`/${shortCode}`);
    } else {
      // 其他保留路徑，重定向到英文版本
      redirect(`/en/${shortCode}`);
    }
  }
  
  // Check for not-found codes
  if (shortCode === 'not-found' || shortCode === '_not-found') {
    console.log(`[Server] Short code is "${shortCode}", triggering 404 page`);
    notFound();
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
    notFound();
  }
}