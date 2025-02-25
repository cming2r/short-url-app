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
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
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
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (!account || !profile) return false;
      return true; // 確保 Google 登入成功
    },
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile.sub; // 將 Google 的 user ID 加入 token
        token.email = profile.email;
        token.name = profile.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
        name: token.name,
      };
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/', // 自訂登入頁面
    error: '/error', // 可選，自訂錯誤頁面
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };