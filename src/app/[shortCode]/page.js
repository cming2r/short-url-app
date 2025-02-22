import { createPool } from '@vercel/postgres';
import { redirect } from 'next/navigation';

export default async function RedirectPage({ params }) {
  const pool = createPool({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
  });

  const { shortCode } = params;

  try {
    const result = await pool.sql`
      SELECT original_url FROM urls WHERE short_code = ${shortCode}
    `;

    await pool.end();

    if (result.rows.length > 0) {
      redirect(result.rows[0].original_url);
    } else {
      return <div>短網址不存在</div>;
    }
  } catch (error) {
    console.error('Redirect error:', error);
    await pool.end();
    return <div>轉址失敗：{error.message}</div>;
  }
}