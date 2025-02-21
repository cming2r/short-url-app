import { nanoid } from 'nanoid';
import sql from '@/lib/db'; // 使用自訂 alias

export async function POST(request) {
  const { url } = await request.json();
  if (!url || !url.startsWith('http')) {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), { status: 400 });
  }

  const shortCode = nanoid(6);
  try {
    await sql`
      INSERT INTO urls (short_code, original_url)
      VALUES (${shortCode}, ${url})
    `;
    const shortUrl = `https://${process.env.VERCEL_URL || 'localhost:3000'}/${shortCode}`;
    return new Response(JSON.stringify({ shortUrl }), { status: 200 });
  } catch (error) {
    if (error.code === '23505') { // 短碼重複（唯一約束違反）
      return new Response(JSON.stringify({ error: 'Short code already exists' }), { status: 409 });
    }
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
}