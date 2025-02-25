// src/components/Header.js
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link href="/" className="hover:underline">網址縮短器</Link>
        </h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="hover:underline">首頁</Link>
            </li>
            {session && (
              <li>
                <Link href="/history" className="hover:underline">歷史記錄</Link>
              </li>
            )}
            <li>
              {session ? (
                <button onClick={() => signOut()} className="hover:underline">登出</button>
              ) : (
                <button onClick={() => signIn('google')} className="hover:underline">Google 登入</button>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}