// src/app/api/shorten/route.js
import { createClient } from '@vercel/postgres';
import { nanoid } from 'nanoid';

const client = createClient({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  queryTimeout: 5000, // 5 秒查詢超時
  connectionTimeout: 5000, // 5 秒連線超時
});

export default {
  async POST(request) {
    console.log('Request method:', request.method);
    console.log('Environment POSTGRES_URL_NON_POOLING:', process.env.POSTGRES_URL_NON_POOLING);
    const startTime = Date.now();

    try {
      await client.connect();
      console.log('Database connection time:', Date.now() - startTime, 'ms');

      const { url } = await request.json();
      let shortCode = nanoid(6);

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

      const shortUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/${shortCode}`;
      console.log('Generated short URL:', shortUrl);
      console.log('Total request time:', Date.now() - startTime, 'ms');

      await client.end();

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
  },

  async GET() {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  },

  async OPTIONS() {
    return new Response(null, {
      status: 204,
      headers: { 'Allow': 'POST' },
    });
  },

  async PUT() {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    });
  },

  async DELETE() {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    });
  },
};