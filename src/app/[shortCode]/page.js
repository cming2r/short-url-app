// src/app/[shortCode]/page.js
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
  // 等待 params 解析
  const shortCode = await params.shortCode;

  try {
    const { data, error } = await supabaseServer
      .from('urls')
      .select('original_url')
      .eq('short_code', shortCode)
      .single();

    if (error || !data) {
      // 如果短網址無效，返回自定義錯誤
      return new Response('短網址無效或處理中，請稍後再試', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // 重定向到原始網址
    redirect(data.original_url);
  } catch (err) {
    console.error('Short URL redirection error:', err);
    return new Response('短網址處理失敗，請稍後再試', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

export const dynamic = 'force-dynamic'; // 確保路由為動態以處理即時查詢