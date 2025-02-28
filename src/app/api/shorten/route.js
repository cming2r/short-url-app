import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import axios from 'axios';
import { load } from 'cheerio';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_KEY is required in environment variables');
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  cookies,
});

async function fetchTitle(url) {
  try {
    // 使用 axios 獲取完整的 HTML
    const response = await axios.get(url, { timeout: 5000 }); // 設置超時，避免延遲過長
    const html = response.data;

    // 使用 cheerio 解析 HTML
    const $ = load(html);
    let title = $('title').text().trim();

    // 處理空標題或無效標題
    if (!title || title === '') {
      return url; // 回傳原始 URL 作為預設標題
    }

    // 特殊處理 Yahoo 網站，確保返回 "Yahoo奇摩"
    if (url.includes('tw.yahoo.com')) {
      title = title.replace(/ - Yahoo奇摩$/, '').trim() || 'Yahoo奇摩';
      // 確保標題不包含多餘字符
      title = title.replace(/^\s*|\s*$/g, '').replace(/\s+/g, ' ');
      if (!title || title === '') title = 'Yahoo奇摩';
    }
    // 處理其他網站，移除多餘後綴並限制長度
    title = title.replace(/ - .*$/, '').replace(/\|.*$/, '').trim() || url;
    return title.length > 50 ? title.substring(0, 50) + '...' : title;
  } catch (error) {
    console.error('Failed to fetch title:', error.message);
    // 為特定網站提供預設簡潔標題
    if (url.includes('tw.yahoo.com')) return 'Yahoo奇摩';
    return url; // 回傳原始 URL 作為預設標題
  }
}

export async function POST(request) {
  console.log('POST /api/shorten called');
  console.log('BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

  const { url, customCode } = await request.json();

  if (!url) {
    return new Response(JSON.stringify({ error: 'Invalid URL, URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 驗證並格式化 URL
  let formattedUrl = url.trim();
  if (!/^https?:\/\//.test(formattedUrl)) {
    // 如果缺少協議，假設為 https
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    new URL(formattedUrl); // 驗證 URL 格式
  } catch (urlError) {
    return new Response(JSON.stringify({ error: 'Invalid URL format, must start with http:// or https://' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let shortCode = customCode || nanoid(6);
  if (customCode && (customCode.length !== 6 || !/^[a-zA-Z0-9]+$/.test(customCode))) {
    return new Response(JSON.stringify({ error: '自訂短碼必須為6位元字母或數字' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    let currentUserId = null;

    // 獲取當前用戶的 session
    const {
      data: { session },
      error: sessionError,
    } = await supabaseServer.auth.getSession();

    console.log('Session retrieval result:', { session, sessionError }); // 詳細日誌調試

    if (sessionError) {
      console.error('Session retrieval error:', sessionError);
    }

    if (customCode) {
      // 自定義短網址要求已登入用戶
      currentUserId = session?.user?.id || null;

      if (!currentUserId) {
        return new Response(JSON.stringify({ error: 'User not authenticated for custom URL' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 檢查是否已有自定義短網址
      const { data: existingCustom, error: customError } = await supabaseServer
        .from('custom_urls')
        .select('short_code')
        .eq('user_id', currentUserId)
        .single();

      if (customError && customError.code !== 'PGRST116') { // PGRST116 表示無記錄
        throw customError;
      }
      if (existingCustom) {
        return new Response(JSON.stringify({ error: '已存在自訂短網址，無法再創建新的自訂短網址' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 檢查自定義短碼是否已被使用
      const { data, error } = await supabaseServer
        .from('custom_urls')
        .select('short_code')
        .eq('short_code', customCode)
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 表示無記錄
        throw error;
      }
      if (data) {
        return new Response(JSON.stringify({ error: '自訂短碼已被使用' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      // 普通縮網址，無論是否登入都允許，但記錄 user_id
      currentUserId = session?.user?.id || null; // 已登入用戶記錄 user_id，未登入為 null
      console.log('Current user ID for regular URL:', currentUserId); // 調試 user_id
    }

    // 獲取 original_url 的標題
    const title = await fetchTitle(formattedUrl);

    if (customCode) {
      // 插入自定義短網址到 custom_urls 表
      const { error } = await supabaseServer.from('custom_urls').insert({
        user_id: currentUserId,
        short_code: shortCode,
        original_url: formattedUrl,
        title,
        created_at: new Date().toISOString(),
        click_count: 0,
      });

      if (error) throw error;
    } else {
      // 插入普通縮網址到 urls 表，確保記錄 user_id
      const { error } = await supabaseServer.from('urls').insert({
        short_code: shortCode,
        original_url: formattedUrl,
        user_id: currentUserId, // 確保已登入用戶的 user_id 記錄
        title,
        created_at: new Date().toISOString(),
        click_count: 0,
      });

      if (error) throw error;
    }

    console.log('Inserted into database successfully');
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`;
    console.log('Generated shortUrl:', shortUrl);

    return new Response(JSON.stringify({ shortUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API error:', { message: error.message, code: error.code });
    return new Response(JSON.stringify({ error: `Internal server error: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { 'Allow': 'POST' },
  });
}