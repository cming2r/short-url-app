// src/app/api/shorten/route.js
import { createPool } from '@vercel/postgres';
import { nanoid } from 'nanoid';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export async function POST(request) {
  console.log('POST /api/shorten called');
  console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
  console.log('BASE_URL:', process.env.BASE_URL);

  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL is not defined');
    return new Response(JSON.stringify({ error: 'Server configuration error: Missing POSTGRES_URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const session = await getServerSession(authOptions);
  const { url, customCode } = await request.json();

  if (!url || !/^https?:\/\//.test(url)) {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
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
      const { rows } = await pool.query('SELECT short_code FROM urls WHERE short_code = $1', [customCode]);
      if (rows.length > 0) {
        return new Response(JSON.stringify({ error: '自訂短碼已被使用' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const userId = session?.user?.id || null; // 未登入用戶設為 null
    await pool.query(
      'INSERT INTO urls (short_code, original_url, user_id) VALUES ($1, $2, $3)',
      [shortCode, url, userId]
    );
    console.log('Inserted into database successfully');

    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
    console.log('Generated shortUrl:', shortUrl);

    return new Response(JSON.stringify({ shortUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API error:', { message: error.message, stack: error.stack, code: error.code });
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