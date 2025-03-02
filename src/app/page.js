'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [isGenerated, setIsGenerated] = useState(false); // 新增狀態追蹤是否生成
  const router = useRouter();

  const handleShorten = async () => {
    setError('');
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
        const errorData = await response.json();
        setError(`縮短網址失敗：${errorData.error || '未知錯誤'}`);
        return;
      }

      const data = await response.json();
      setShortUrl(data.shortUrl);
      setIsGenerated(true); // 標記已生成
    } catch (err) {
      setError(`縮短網址失敗：${err.message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-4">縮短網址服務</h1>
        <input
          type="text"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="輸入長網址"
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleShorten}
          className={`w-full p-2 rounded text-white ${
            isGenerated ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-800 hover:bg-gray-900'
          }`}
        >
          縮短
        </button>
        {shortUrl && (
          <div className="mt-4 text-center">
            <p className="font-bold">縮短後的網址：</p>
            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              {shortUrl}
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shortUrl);
                alert('已複製到剪貼簿！');
              }}
              className="ml-2 text-sm text-gray-500 underline"
            >
              複製網址
            </button>
          </div>
        )}
        {error && <p className="mt-2 text-center text-red-500">{error}</p>}
        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/history')}
            className="text-blue-500 underline"
          >
            查看歷史記錄
          </button>
          <span className="mx-2">|</span>
          <button
            onClick={() => router.push('/custom')}
            className="text-blue-500 underline"
          >
            自訂短網址服務
          </button>
        </div>
      </div>
    </div>
  );
}