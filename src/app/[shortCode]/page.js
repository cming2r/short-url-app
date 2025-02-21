import sql from '@/lib/db';

export default async function RedirectPage({ params }) {
  const { shortCode } = params;

  try {
    const rows = await sql`
      SELECT original_url FROM urls WHERE short_code = ${shortCode}
    `;
    if (rows.length === 0) {
      return <div>404 - Short URL not found</div>;
    }

    const originalUrl = rows[0].original_url;
    return Response.redirect(originalUrl, 302);
  } catch (error) {
    console.error('Database error:', error); // 記錄詳細錯誤
    return <div>Database error: {error.message}</div>; // 顯示