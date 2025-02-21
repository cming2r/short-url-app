'use client'; // 表示這是客戶端元件，因為我們要用 useState

import { useState } from 'react';
import { nanoid } from 'nanoid';

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');

  const handleShorten = () => {
    const shortCode = nanoid(6); // 生成 6 位隨機短碼
    const generatedShortUrl = `short-url-app-olive.vercel.app/${shortCode}`; // 暫時假設域名
    setShortUrl(generatedShortUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">網址縮短器c</h1>
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
      </div>
    </div>
  );
}