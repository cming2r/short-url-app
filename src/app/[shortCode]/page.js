import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in environment variables');
}

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  cookies,
});

export default async function ShortUrl({ params }) {
  console.log('ShortUrl route called with params:', params);
  console.log('Environment variables:', {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  // 確保 params 為 Promise，等待解析
  const resolvedParams = await params;
  const shortCode = resolvedParams.shortCode;
  console.log('Processing shortCode:', shortCode);

  // 如果 shortCode 是 'not-found' 或 '_not-found'，直接導向內建 404 頁面，避免重定向循環
  if (shortCode === 'not-found' || shortCode === '_not-found') {
    console.log(`Short code is "${shortCode}", redirecting to /_not-found`);
    redirect('/_not-found');
  }

  // 首先檢查 custom_urls 表（忽略大小寫比較）
  const { data: customData, error: customError } = await supabaseServer
    .from('custom_urls')
    .select('original_url, click_count, short_code')
    .ilike('short_code', shortCode) // 使用 ilike 忽略大小寫
    .single();

  if (customError) {
    if (customError.code === 'PGRST116') {
      console.log('No matching record found in custom_urls for shortCode:', shortCode);
    } else {
      console.error('Error querying custom_urls:', customError);
    }
  }

  if (customData) {
    console.log(`Found in custom_urls:`, customData);
    // 更新 custom_urls 表的點擊次數
    const newClickCount = (customData.click_count || 0) + 1;
    const { error: updateError } = await supabaseServer
      .from('custom_urls')
      .update({ click_count: newClickCount })
      .eq('short_code', customData.short_code); // 使用儲存的 short_code 值

    if (updateError) {
      console.error('Failed to update click_count in custom_urls:', updateError);
    } else {
      console.log(`Updated click_count in custom_urls for ${shortCode}: ${newClickCount}`);
    }

    // 驗證並格式化 original_url
    let originalUrl = customData.original_url.trim();
    if (!/^https?:\/\//.test(originalUrl)) {
      originalUrl = `https://${originalUrl}`;
    }

    try {
      new URL(originalUrl); // 驗證 URL 格式
    } catch (urlError) {
      console.error('Invalid original URL in custom_urls:', originalUrl, urlError);
      redirect('/not-found'); // 導向自定義 404 頁面
    }

    // 重定向到原始網址
    console.log(`Redirecting to original URL: ${originalUrl}`);
    redirect(originalUrl);
  }

  // 如果 custom_urls 表中找不到，檢查 urls 表（忽略大小寫比較）
  const { data: urlData, error: urlError } = await supabaseServer
    .from('urls')
    .select('original_url, click_count, short_code')
    .ilike('short_code', shortCode) // 使用 ilike 忽略大小寫
    .single();

  if (urlError) {
    if (urlError.code === 'PGRST116') {
      console.log('No matching record found in urls for shortCode:', shortCode);
    } else {
      console.error('Error querying urls:', urlError);
    }
  }

  if (urlData) {
    console.log(`Found in urls:`, urlData);
    // 更新 urls 表的點擊次數
    const newClickCount = (urlData.click_count || 0) + 1;
    const { error: updateError } = await supabaseServer
      .from('urls')
      .update({ click_count: newClickCount })
      .eq('short_code', urlData.short_code); // 使用儲存的 short_code 值

    if (updateError) {
      console.error('Failed to update click_count in urls:', updateError);
    } else {
      console.log(`Updated click_count in urls for ${shortCode}: ${newClickCount}`);
    }

    // 驗證並格式化 original_url
    let originalUrl = urlData.original_url.trim();
    if (!/^https?:\/\//.test(originalUrl)) {
      originalUrl = `https://${originalUrl}`;
    }

    try {
      new URL(originalUrl); // 驗證 URL 格式
    } catch (urlError) {
      console.error('Invalid original URL in urls:', originalUrl, urlError);
      redirect('/not-found'); // 導向自定義 404 頁面
    }

    // 重定向到原始網址
    console.log(`Redirecting to original URL: ${originalUrl}`);
    redirect(originalUrl);
  }

  // 如果短網址無效，導向自定義 404 頁面
  console.log(`Short code ${shortCode} not found, redirecting to /not-found`);
  redirect('/not-found');
}

export const dynamic = 'force-dynamic'; // 確保路由為動態以處理即時查詢
export const revalidate = 0; // 每次請求都重新驗證