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
  console.log('POSTGRES_URL_NON_POOLING for redirect:', process.env.POSTGRES_URL_NON_POOLING);
  const client = await getClient();
  console.log('Reusing database client for redirect');

  const { shortCode } = params;

  try {
    const result = await client.query('SELECT original_url FROM urls WHERE short_code = $1', [shortCode]);

    if (result.rows.length > 0) {
      redirect(result.rows[0].original_url);
    } else {
      return <div>短網址不存在</div>;
    }
  } catch (error) {
    console.error('Redirect error:', error);
    return <div>轉址失敗：{error.message}</div>;
  }
}