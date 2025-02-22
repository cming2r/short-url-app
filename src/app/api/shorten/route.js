import { createClient } from '@vercel/postgres';
import { nanoid } from 'nanoid';

let dbClient = null;

async function getClient() {
  if (!dbClient) {
    dbClient = createClient({
      connectionString: process.env.POSTGRES_URL_NON_POOLING,
    });
    await dbClient.connect();
    console.log('Database client initialized');
  }
  return dbClient;
}

export async function POST(request) {
  console.log('Environment POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING);
  const startTime = Date.now();
  const client = await getClient();
  console.log('Database connection time:', Date.now() - startTime, 'ms');

  const { url } = await request.json();
  let shortCode = nanoid(6);

  try {
    const checkStart = Date.now();
    let existing = await client.query('SELECT short_code FROM urls WHERE short_code = $1', [shortCode]);
    console.log('Existing check time:', Date.now() - checkStart, 'ms');
    console.log('Existing check result:', existing.rows);
    while (existing.rows.length > 0) {
      shortCode = nanoid(6);
      const newCheckStart = Date.now();
      existing = await client.query('SELECT short_code FROM urls WHERE short_code = $1', [shortCode]);
      console.log('Generated new shortCode:', shortCode);
      console.log('New check time:', Date.now() - newCheckStart, 'ms');
    }

    const insertStart = Date.now();
    console.log('Inserting into database:', { shortCode, url });
    await client.query('INSERT INTO urls (short_code, original_url) VALUES ($1, $2)', [shortCode, url]);
    console.log('Insert time:', Date.now() - insertStart, 'ms');

    const shortUrl = `https://${process.env.VERCEL_URL || 'localhost:3000'}/${shortCode}`;
    console.log('Generated short URL:', shortUrl);
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 新增處理其他方法以避免 405
export async function GET() {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  });
}