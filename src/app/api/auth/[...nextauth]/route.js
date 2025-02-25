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
      console.log('Creating user:', user);
      const { rows } = await pool.query(
        'INSERT INTO auth.users (id, email, name) VALUES ($1, $2, $3) RETURNING id',
        [user.id, user.email, user.name]
      );
      return { id: rows[0].id, email: user.email, name: user.name };
    },
    async getUser(id) {
      console.log('Getting user:', id);
      const { rows } = await pool.query('SELECT * FROM auth.users WHERE id = $1', [id]);
      return rows[0] || null;
    },
    async updateUser(user) {
      console.log('Updating user:', user);
      await pool.query(
        'UPDATE auth.users SET email = $2, name = $3 WHERE id = $1',
        [user.id, user.email, user.name]
      );
      return user;
    },
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('SignIn callback:', { user, account, profile });
      return true; // 允許登入
    },
    async jwt({ token, account, profile }) {
      console.log('JWT callback:', { token, account, profile });
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile.sub; // 使用 Google 的 user ID
      }
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback:', { session, token });
      session.user.id = token.id || token.sub;
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/', // 確保從首頁開始登入
  },
  debug: true, // 啟用調試模式，幫助診斷
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };