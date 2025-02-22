// src/app/page.js
'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');

  const handleShorten = async () => {
    setError('');
    setShortUrl('');
    if (!longUrl || !/^https?:\/\//.test(longUrl)) {
      setError('請輸入有效的 URL（需包含 http:// 或 https://）');
      return;
    }

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl }),
      });

      if (!response.ok) {
        const text = await response.text(); // 先獲取原始回應
        console.error('API raw response:', text);
        throw new Error(`API request failed with status ${response.status}: ${text}`);
      }

      const data = await response.json();
      if (data.shortUrl) {
        setShortUrl(data.shortUrl);
      } else {
        setError('縮短網址失敗：未收到短網址');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`縮短網址失敗：${err.message}`);
    }
  };

  useEffect(() => {
    console.log('shortUrl updated:', shortUrl);
  }, [shortUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
        {shortUrl ? (
          <p className="mt-4 text-center">
            短網址:{' '}
            <a href={shortUrl} className="text-blue-500 underline">
              {shortUrl}
            </a>
          </p>
        ) : (
          <p className="mt-4 text-center">尚未生成短網址</p>
        )}
        {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
}