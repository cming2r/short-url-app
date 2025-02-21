import { sql } from '@vercel/postgres';
import { nanoid } from 'nanoid';

export async function POST(request) {
  const { url } = await request.json(); // 從請求中獲取長網址
  const shortCode = nanoid(6); // 生成 6 位短碼

  try {
    await sql`
      INSERT INTO urls (short_code, original_url)
      VALUES (${shortCode}, ${url})
    `;
    const shortUrl = `https://${process.env.VERCEL_URL || 'localhost:3000'}/${shortCode}`;
    return new Response(JSON.stringify({ shortUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to shorten URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}