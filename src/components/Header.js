'use client';

import { useState, useEffect } from 'react';
import { supabase, getCurrentSiteUrl } from '@/lib/supabase';
import Link from 'next/link';

export default function Header() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    // 檢測當前環境
    const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    // 根據環境選擇適當的重定向 URL
    const redirectUrl = isLocalhost 
      ? 'http://localhost:3000' 
      : 'https://short-url-app-olive.vercel.app';
    
    console.log('登入重定向URL:', redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      }
    });
    
    if (error) console.error('Error signing in:', error);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

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
              <>
                <li>
                  <Link href="/custom" className="hover:underline">自訂短網址</Link>
                </li>
                <li>
                  <Link href="/history" className="hover:underline">歷史記錄</Link>
                </li>
              </>
            )}
            <li>
              {session ? (
                <button onClick={handleSignOut} className="hover:underline">
                  登出（{session.user?.email || '用戶'}）
                </button>
              ) : (
                <button onClick={handleSignIn} className="hover:underline">
                  Google 登入
                </button>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}