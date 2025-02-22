// src/app/[shortCode]/page.js
import { createClient } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export default async function RedirectPage({ params }) {
  const startTime = Date.now();
  console.log('POSTGRES_URL_NON_POOLING for redirect:', process.env.POSTGRES_URL_NON_POOLING);

  const client = createClient({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
    queryTimeout: 5000, // 5 秒查詢超時
    connectionTimeout: 5000, // 5 秒連線超時
  });

  try {
    await client.connect();
    console.log('Database connection time:', Date.now() - startTime, 'ms');

    // 等待 params，並獲取 shortCode
    const awaitedParams = await params;
    const { shortCode } = awaitedParams;

    const queryStart = Date.now();
    const result = await client.query('SELECT original_url FROM urls WHERE short_code = $1', [shortCode]);

    console.log('Query time:', Date.now() - queryStart, 'ms');
    console.log('Query result for shortCode', shortCode, ':', result.rows);

    if (result.rows.length > 0) {
      const originalUrl = result.rows[0].original_url;
      console.log('Redirecting to:', originalUrl);
      console.log('Total request time:', Date.now() - startTime, 'ms');

      await client.end();
      return NextResponse.redirect(originalUrl);
    } else {
      await client.end();
      return new NextResponse(
        `
          <div class="min-h-screen flex items-center justify-center">
            <p class="text-red-500">短網址不存在</p>
          </div>
        `,
        {
          status: 404,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }
  } catch (error) {
    console.error('Redirect error:', error);
    await client.end();
    return new NextResponse(
      `
        <div class="min-h-screen flex items-center justify-center">
          <p class="text-red-500">轉址失敗：${error.message}</p>
        </div>
      `,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}