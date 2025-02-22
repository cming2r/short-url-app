import { createClient } from '@vercel/postgres';
import { redirect } from 'next/navigation';

let dbClient = null;

async function getClient() {
  if (!dbClient) {
    dbClient = createClient({
      connectionString: process.env.POSTGRES_URL,
    });
    await dbClient.connect();
    console.log('Database client initialized for redirect');
  }
  return dbClient;
}

export default async function RedirectPage({ params }) {
  console.log('POSTGRES_URL for redirect:', process.env.POSTGRES_URL);
  const client = await getClient();
  console.log('Reusing database client for redirect');

  const { shortCode } = params;

  try {
    const result = await client.query('SELECT original_url FROM urls WHERE short_code = $1', [shortCode]);

    console.log('Query result for shortCode', shortCode, ':', result.rows);

    if (result.rows.length > 0) {
      const originalUrl = result.rows[0].original_url;
      console.log('Redirecting to:', originalUrl);
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