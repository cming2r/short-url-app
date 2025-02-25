// src/app/api/history/route.js
import { createPool } from '@vercel/postgres';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { rows } = await pool.query(
      'SELECT short_code, original_url FROM urls WHERE user_id = $1 ORDER BY created_at DESC',
      [session.user.id]
    );
    return new Response(JSON.stringify({ urls: rows }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}