import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in environment variables');
}

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  cookies,
});

export async function GET(request, { params }) {
  // 從路由參數或查詢字符串中獲取短代碼
  let shortCode;
  
  // 檢查查詢參數中是否有短碼
  const { searchParams } = new URL(request.url);
  const codeParam = searchParams.get('code');
  
  if (codeParam) {
    // 如果查詢參數中有短碼，使用它
    shortCode = codeParam;
    console.log('GET /api/redirect called with code from query param:', shortCode);
  } else {
    // 否則使用路由參數中的短碼
    shortCode = params.shortCode;
    console.log('GET /api/[shortCode] called with shortCode from path:', shortCode);
  }
  
  console.log('Environment variables:', {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  // 如果 shortCode 是 'not-found' 或 '_not-found'，直接重定向到 /not-found
  if (shortCode === 'not-found' || shortCode === '_not-found') {
    console.log(`Short code is "${shortCode}", redirecting to /not-found`);
    return NextResponse.redirect(new URL('/not-found', request.url));
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
    // 同時更新點擊次數和最後點擊時間
    const { error: updateError } = await supabaseServer
      .from('custom_urls')
      .update({ 
        click_count: newClickCount,
        last_clicked_at: new Date().toISOString() 
      })
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
      return NextResponse.redirect(new URL('/not-found', request.url));
    }

    // 重定向到原始網址
    console.log(`Redirecting to original URL: ${originalUrl}`);
    return NextResponse.redirect(originalUrl, 302);
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
    // 同時更新點擊次數和最後點擊時間
    const { error: updateError } = await supabaseServer
      .from('urls')
      .update({ 
        click_count: newClickCount,
        last_clicked_at: new Date().toISOString() 
      })
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
      return NextResponse.redirect(new URL('/not-found', request.url));
    }

    // 重定向到原始網址
    console.log(`Redirecting to original URL: ${originalUrl}`);
    return NextResponse.redirect(originalUrl, 302);
  }

  // 如果短網址無效，重定向到 /not-found
  console.log(`Short code ${shortCode} not found, redirecting to /not-found`);
  return NextResponse.redirect(new URL('/not-found', request.url));
}