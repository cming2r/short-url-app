import { createClient } from '@vercel/postgres';
import { nanoid } from 'nanoid';

export async function POST(request) {
  console.log('Environment POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING);
  const client = createClient({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
  });

  await client.connect(); // 連接到資料庫

  const { url } = await request.json();
  let shortCode = nanoid(6);

  try {
    console.log('Received URL:', url);
    let existing = await client.query('SELECT short_code FROM urls WHERE short_code = $1', [shortCode]);
    console.log('Existing check result:', existing.rows);
    while (existing.rows.length > 0) {
      shortCode = nanoid(6);
      existing = await client.query('SELECT short_code FROM urls WHERE short_code = $1', [shortCode]);
      console.log('Generated new shortCode:', shortCode);
    }

    console.log('Inserting into database:', { shortCode, url });
    await client.query('INSERT INTO urls (short_code, original_url) VALUES ($1, $2)', [shortCode, url]);
    const shortUrl = `https://${process.env.VERCEL_URL || 'localhost:3000'}/${shortCode}`;
    console.log('Generated short URL:', shortUrl);

    await client.end(); // 關閉連線

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
    await client.end();
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}