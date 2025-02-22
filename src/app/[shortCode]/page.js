import { createPool } from '@vercel/postgres';
import { redirect } from 'next/navigation';

// 建立連接池，使用 POSTGRES_URL_NON_POOLING
const pool = createPool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
});

export default async function RedirectPage({ params }) {
  const { shortCode } = params;

  const result = await pool.sql`
    SELECT original_url FROM urls WHERE short_code = ${shortCode}
  `;

  if (result.rows.length > 0) {
    redirect(result.rows[0].original_url);
  } else {
    return <div>短網址不存在</div>;
  }
}