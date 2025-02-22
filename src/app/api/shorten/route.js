// src/app/api/shorten/route.js
import { createClient } from '@vercel/postgres';
import { nanoid } from 'nanoid';

export async function POST(request) {
  console.log('POST /api/shorten called');
  console.log('POSTGRES_URL:', process.env.POSTGRES_URL);
  console.log('BASE_URL:', process.env.BASE_URL);

  if (!process.env.POSTGRES_URL) {
    console.error('POSTGRES_URL is not defined');
    return new Response(JSON.stringify({ error: 'Server configuration error: Missing POSTGRES_URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const client = createClient({
    connectionString: process.env.POSTGRES_URL,
    queryTimeout: 5000,
    connectionTimeout: 5000,
  });

  try {
    await client.connect();
    console.log('Database connected successfully');

    const { url } = await request.json();
    console.log('Received URL:', url);
    if (!url || !/^https?:\/\//.test(url)) {
      await client.end();
      return new Response(JSON.stringify({ error: 'Invalid URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let shortCode;
    let attempts = 0;
    const maxAttempts = 3;
    do {
      shortCode = nanoid(6);
      console.log('Generated shortCode:', shortCode);
      try {
        await client.query('INSERT INTO urls (short_code, original_url) VALUES ($1, $2)', [shortCode, url]);
        console.log('Inserted into database successfully');
        break;
      } catch (err) {
        if (err.code === '23505') {
          attempts++;
          console.log('Short code collision, attempt:', attempts);
          if (attempts >= maxAttempts) {
            throw new Error('Unable to generate unique short code');
          }
        } else {
          throw err;
        }
      }
    } while (true);

    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;
    console.log('Generated shortUrl:', shortUrl);
    await client.end();

    return new Response(JSON.stringify({ shortUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
    });
    await client.end();
    return new Response(JSON.stringify({ error: `Internal server error: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { 'Allow': 'POST' },
  });
}