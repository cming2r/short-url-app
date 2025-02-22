// src/app/api/[shortCode]/route.js
import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  console.log('GET /api/[shortCode] called with:', params.shortCode);

  const client = createClient({
    connectionString: process.env.POSTGRES_URL,
    queryTimeout: 5000,
    connectionTimeout: 5000,
  });

  try {
    await client.connect();
    console.log('Database connected');

    const result = await client.query('SELECT original_url FROM urls WHERE short_code = $1', [params.shortCode]);
    console.log('Query result:', result.rows);
    await client.end();

    if (result.rows.length > 0) {
      console.log('Redirecting to:', result.rows[0].original_url);
      return NextResponse.redirect(result.rows[0].original_url);
    } else {
      return new Response('短網址不存在', {
        status: 404,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  } catch (error) {
    console.error('Redirect error:', error);
    await client.end();
    return new Response(`轉址失敗：${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}