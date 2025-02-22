import { createClient } from '@vercel/postgres';
import { nanoid } from 'nanoid';

export async function POST(request) {
  console.log('Environment POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING);
  const startTime = Date.now(); // 開始時間
  const client = createClient({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
  });

  try {
    await client.connect();
    console.log('Database connection established in:', Date.now() - startTime, 'ms');

    const { url } = await request.json();
    let shortCode = nanoid(6);

    console.log('Received URL:', url);
    let existing = await client.query('SELECT short_code FROM urls WHERE short_code = $1', [shortCode]);
    console.log('Existing check completed in:', Date.now() - startTime, 'ms');
    console.log('Existing check result:', existing.rows);
    while (existing.rows.length > 0) {
      shortCode = nanoid(6);
      existing = await client.query('SELECT short_code FROM urls WHERE short_code = $1', [shortCode]);
      console.log('Generated new shortCode:', shortCode);
    }

    console.log('Inserting into database...');
    await client.query('INSERT INTO urls (short_code, original_url) VALUES ($1, $2)', [shortCode, url]);
    console.log('Insert completed in:', Date.now() - startTime, 'ms');

    const shortUrl = `https://${process.env.VERCEL_URL || 'localhost:3000'}/${shortCode}`;
    console.log('Generated short URL:', shortUrl);

    await client.end();
    console.log('Total request time:', Date.now() - startTime, 'ms');

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