import { createPool } from '@vercel/postgres';
import { nanoid } from 'nanoid';

export async function POST(request) {
  // 在請求處理時動態建立連接池
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
  });

  const { url } = await request.json();
  let shortCode = nanoid(6);

  try {
    console.log('Received URL:', url);
    // 檢查短碼是否已存在
    let existing = await pool.sql`SELECT short_code FROM urls WHERE short_code = ${shortCode}`;
    console.log('Existing check result:', existing.rows);
    while (existing.rows.length > 0) {
      shortCode = nanoid(6);
      existing = await pool.sql`SELECT short_code FROM urls WHERE short_code = ${shortCode}`;
      console.log('Generated new shortCode:', shortCode);
    }

    console.log('Inserting into database:', { shortCode, url });
    await pool.sql`
      INSERT INTO urls (short_code, original_url)
      VALUES (${shortCode}, ${url})
    `;
    const shortUrl = `https://${process.env.VERCEL_URL || 'localhost:3000'}/${shortCode}`;
    console.log('Generated short URL:', shortUrl);

    // 關閉連接池（可選，避免資源洩漏）
    await pool.end();

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
    await pool.end(); // 確保錯誤時也關閉
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}