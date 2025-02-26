import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_KEY is required in environment variables');
}

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  cookies,
});

export default async function ShortUrl({ params }) {
  // 確保 params 為 Promise，等待解析
  const resolvedParams = await params;
  const shortCode = resolvedParams.shortCode;

  try {
    const { data, error } = await supabaseServer
      .from('urls')
      .select('original_url')
      .eq('short_code', shortCode)
      .single();

    if (error || !data || !data.original_url) {
      // 如果短網址無效，返回自定義錯誤
      return new Response('短網址無效或處理中，請稍後再試', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // 增加點擊次數
    await supabaseServer
      .from('urls')
      .update({ click_count: data.click_count + 1 })
      .eq('short_code', shortCode);

    // 驗證並格式化 original_url
    let originalUrl = data.original_url.trim();
    if (!/^https?:\/\//.test(originalUrl)) {
      // 如果缺少協議，假設為 https
      originalUrl = `https://${originalUrl}`;
    }

    // 確保 originalUrl 是一個有效的 URL
    try {
      new URL(originalUrl); // 驗證 URL 格式
    } catch (urlError) {
      console.error('Invalid original URL:', originalUrl, urlError);
      return new Response('原始網址格式無效', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // 重定向到原始網址
    redirect(originalUrl);
  } catch (err) {
    console.error('Short URL redirection error:', err);
    return new Response('短網址處理失敗，請稍後再試', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

export const dynamic = 'force-dynamic'; // 確保路由為動態以處理即時查詢
export const revalidate = 0; // 每次請求都重新驗證