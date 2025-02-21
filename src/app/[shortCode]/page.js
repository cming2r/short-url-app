import { sql } from '@vercel/postgres';
import { redirect } from 'next/navigation';

export default async function RedirectPage({ params }) {
  const { shortCode } = params;

  const result = await sql`
    SELECT original_url FROM urls WHERE short_code = ${shortCode}
  `;

  if (result.rows.length > 0) {
    redirect(result.rows[0].original_url); // 轉址到原始網址
  } else {
    return <div>短網址不存在</div>; // 若無記錄，顯示錯誤
  }
}