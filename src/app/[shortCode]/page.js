import { createClient } from '@vercel/postgres';
import { redirect } from 'next/navigation';

export default async function RedirectPage({ params }) {
  console.log('POSTGRES_URL_NON_POOLING for redirect:', process.env.POSTGRES_URL_NON_POOLING);
  const client = createClient({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
  });

  await client.connect();

  const { shortCode } = params;

  try {
    const result = await client.query('SELECT original_url FROM urls WHERE short_code = $1', [shortCode]);

    await client.end();

    if (result.rows.length > 0) {
      redirect(result.rows[0].original_url);
    } else {
      return <div>短網址不存在</div>;
    }
  } catch (error) {
    console.error('Redirect error:', error);
    await client.end();
    return <div>轉址失敗：{error.message}</div>;
  }
}