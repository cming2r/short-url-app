// src/app/api/shorten/route.js
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_KEY is required in environment variables');
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  cookies,
});

export async function POST(request) {
  console.log('POST /api/shorten called');
  console.log('BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

  const { url, customCode } = await request.json();

  if (!url || !/^https?:\/\//.test(url)) {
    return new Response(JSON.stringify({ error: 'Invalid URL, must start with http:// or https://' }), {
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
    const userId = session?.user?.id || null; // 從當前會話獲取 userId

    const { error } = await supabaseServer.from('urls').insert({
      short_code: shortCode,
      original_url: url,
      user_id: userId,
      created_at: new Date().toISOString(),
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