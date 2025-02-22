'use client';

import { useState } from 'react';

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState(''); // 新增錯誤狀態

  const handleShorten = async () => {
    setError(''); // 重置錯誤訊息
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
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
        {shortUrl && (
          <p className="mt-4 text-center">
            短網址:{' '}
            <a href={shortUrl} className="text-blue-500 underline">
              {shortUrl}
            </a>
          </p>
        )}
        {error && (
          <p className="mt-4 text-center text-red-500">{error}</p>
        )}
      </div>
    </div>
  );
}