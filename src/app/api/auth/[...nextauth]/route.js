// src/app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createPool } from '@vercel/postgres';

const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: {
    async createUser(user) {
      const { rows } = await pool.query(
        'INSERT INTO auth.users (id, email, name) VALUES ($1, $2, $3) RETURNING id',
        [user.id, user.email, user.name]
      );
      return { id: rows[0].id, email: user.email, name: user.name };
    },
    async getUser(id) {
      const { rows } = await pool.query('SELECT * FROM auth.users WHERE id = $1', [id]);
      return rows[0] || null;
    },
    // 其他必要的 adapter 方法可根據需求實現
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub; // 將用戶 ID 加入 session
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };