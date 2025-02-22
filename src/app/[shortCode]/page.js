// src/app/[shortCode]/page.js
import { createClient } from '@vercel/postgres';
import { redirect } from 'next/navigation';

let dbClient = null;

async function getClient() {
  if (!dbClient) {
    dbClient = createClient({
      connectionString: process.env.POSTGRES_URL_NON_POOLING,
    });
    await dbClient.connect();
    console.log('Database client initialized for redirect');
  }
  return dbClient;
}

export default async function RedirectPage({ params }) {
  const startTime = Date.now();
  console.log('POSTGRES_URL_NON_POOLING for redirect:', process.env.POSTGRES_URL_NON_POOLING);
  const client = await getClient();
  console.log('Database connection time:', Date.now() - startTime, 'ms');

  // 等待 params，並獲取 shortCode
  const awaitedParams = await params;
  const { shortCode } = awaitedParams;

  try {
    const queryStart = Date.now();
    const result = await client.query('SELECT original_url FROM urls WHERE short_code = $1', [shortCode]);

    console.log('Query time:', Date.now() - queryStart, 'ms');
    console.log('Query result for shortCode', shortCode, ':', result.rows);

    if (result.rows.length > 0) {
      const originalUrl = result.rows[0].original_url;
      console.log('Redirecting to:', originalUrl);
      console.log('Total request time:', Date.now() - startTime, 'ms');
      // 確保使用正確的 redirect 方法
      redirect(originalUrl);
    } else {
      await client.end();
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-red-500">短網址不存在</p>
        </div>
      );
    }
  } catch (error) {
    console.error('Redirect error:', error);
    await client.end();
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">轉址失敗：{error.message}</p>
      </div>
    );
  }
}