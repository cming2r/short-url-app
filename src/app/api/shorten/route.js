// src/app/api/shorten/route.js
import { createClient } from '@vercel/postgres';
import { nanoid } from 'nanoid';

export async function POST(request) {
  const client = createClient({
    connectionString: process.env.POSTGRES_URL, // 使用池化連線
    queryTimeout: 5000,
    connectionTimeout: 5000,
  });

  try {
    await client.connect();
    const { url } = await request.json();
    if (!url || !/^https?:\/\//.test(url)) {
      await client.end();
      return new Response(JSON.stringify({ error: '無效的 URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let shortCode;
    let attempts = 0;
    const maxAttempts = 3; // 避免無限迴圈
    do {
      shortCode = nanoid(6);
      try {
        await client.query('INSERT INTO urls (short_code, original_url) VALUES ($1, $2)', [shortCode, url]);
        break; // 插入成功，跳出迴圈
      } catch (err) {
        if (err.code === '23505') { // PostgreSQL 唯一性衝突
          attempts++;
          if (attempts >= maxAttempts) {
            throw new Error('無法生成唯一短碼，請稍後再試');
          }
        } else {
          throw err;
        }
      }
    } while (true);

    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
    await client.end();

    return new Response(JSON.stringify({ shortUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    await client.end();
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 處理非 POST 請求
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