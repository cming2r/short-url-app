// src/app/history/page.js
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export default function History() {
  const { data: session, status } = useSession();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/history')
        .then((res) => res.json())
        .then((data) => {
          setUrls(data.urls || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Fetch history error:', err);
          setLoading(false);
        });
    }
  }, [status]);

  if (status === 'loading') return <p className="text-center">載入中...</p>;
  if (status === 'unauthenticated') return <p className="text-center">請先登入以查看歷史記錄</p>;

  return (
    <div className="flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-4">短網址歷史記錄</h1>
        {loading ? (
          <p className="text-center">載入中...</p>
        ) : urls.length === 0 ? (
          <p className="text-center">尚無短網址記錄</p>
        ) : (
          <ul className="space-y-2">
            {urls.map((url) => (
              <li key={url.short_code} className="flex justify-between items-center">
                <a
                  href={url.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {`${process.env.NEXTAUTH_URL}/${url.short_code}`}
                </a>
                <span className="text-gray-600 truncate max-w-xs">{url.original_url}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}