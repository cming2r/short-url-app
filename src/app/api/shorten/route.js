import { sql } from '@vercel/postgres';
import { nanoid } from 'nanoid';

export async function POST(request) {
  const { url } = await request.json();
  let shortCode = nanoid(6);

  try {
    console.log('Received URL:', url); // 記錄接收到的網址
    // 檢查短碼是否已存在
    let existing = await sql`SELECT short_code FROM urls WHERE short_code = ${shortCode}`;
    console.log('Existing check result:', existing.rows); // 記錄查詢結果
    while (existing.rows.length > 0) {
      shortCode = nanoid(6);
      existing = await sql`SELECT short_code FROM urls WHERE short_code = ${shortCode}`;
      console.log('Generated new shortCode:', shortCode);
    }

    console.log('Inserting into database:', { shortCode, url });
    await sql`
      INSERT INTO urls (short_code, original_url)
      VALUES (${shortCode}, ${url})
    `;
    const shortUrl = `https://${process.env.VERCEL_URL || 'localhost:3000'}/${shortCode}`;
    console.log('Generated short URL:', shortUrl);
    return new Response(JSON.stringify({ shortUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}