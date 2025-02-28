'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log('Client session in page.js:', session); // 調試客戶端 session
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      console.log('Auth state changed in page.js:', { event, session }); // 調試 auth 事件
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleShorten = async () => {
    setError('');
    setShortUrl('');
    if (!longUrl || !/^https?:\/\//.test(longUrl)) {
      setError('請輸入有效的 URL（需包含 http:// 或 https://）');
      return;
    }

    try {
      const userId = session?.user?.id || null;
      console.log('User ID sent from page.js:', userId); // 調試 userId
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl, userId }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('API raw response:', text);
        throw new Error(`API request failed with status ${response.status}: ${text}`);
      }

      const data = await response.json();
      if (data.shortUrl) {
        setShortUrl(data.shortUrl);
        setLongUrl(''); // 清空輸入
      } else {
        setError('縮短網址失敗：未收到短網址');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`縮短網址失敗：${err.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    alert('短網址已複製到剪貼簿！');
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">網址縮短器</h1>
        <input
          type="text"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="輸入長網址"
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleShorten}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          縮短
        </button>
        {shortUrl && (
          <div className="mt-4 flex items-center justify-center space-x-2">
            <p className="text-center">
              您的短網址:{' '}
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {shortUrl}
              </a>
            </p>
            <button
              onClick={handleCopy}
              className="bg-gray-200 text-black px-2 py-1 rounded hover:bg-gray-300"
            >
              複製
            </button>
          </div>
        )}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
}