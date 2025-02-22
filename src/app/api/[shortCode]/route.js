// src/app/api/[shortCode]/route.js
import { createPool } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// 在模組層級創建連線池（單例模式）
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export async function GET(request, { params }) {
  console.log('GET /api/[shortCode] called with:', params.shortCode);

  try {
    const result = await pool.query('SELECT original_url FROM urls WHERE short_code = $1', [params.shortCode]);
    console.log('Query result:', result.rows);

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
    console.error('Redirect error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    return new Response(`轉址失敗：${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
  // 注意：不使用 pool.end()，保持連線池活躍
}