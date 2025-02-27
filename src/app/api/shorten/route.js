import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import axios from 'axios'; 
import cheerio from 'cheerio'; 

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
    const $ = cheerio.load(html);
    let title = $('title').text().trim();

    // 處理空標題或無效標題
    if (!title || title === '') {
      return url; // 回傳原始 URL 作為預設標題
    }

    // 移除多餘後綴並限制長度
    title = title.replace(/ - .*$/, '').replace(/\|.*$/, '').trim() || url;
    return title.length > 50 ? title.substring(0, 50) + '...' : title;
  } catch (error) {
    console.error('Failed to fetch title:', error.message);
    return url; // 回傳原始 URL 作為預設標題
  }
}

export async function POST(request) {
  console.log('POST /api/shorten called');
  console.log('BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

  const { url, customCode, userId } = await request.json();

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
    if (customCode) {
      const { data, error } = await supabaseServer
        .from('urls')
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
    }

    const {
      data: { session },
    } = await supabaseServer.auth.getSession();
    const currentUserId = session?.user?.id || userId || null; // 從會話或請求獲取 userId

    if (!currentUserId) {
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 獲取 original_url 的標題
    const title = await fetchTitle(formattedUrl);

    const { error } = await supabaseServer.from('urls').insert({
      short_code: shortCode,
      original_url: formattedUrl,
      user_id: currentUserId, // 確保 user_id 設置正確
      custom_code: !!customCode, // 如果有 customCode，標記為 true
      title, // 儲存任何網址的標題
      created_at: new Date().toISOString(), // 確保 created_at 設置
      click_count: 0, // 初始點擊次數為 0
    });

    if (error) throw error;

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