'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function History() {
  const [session, setSession] = useState(null);
  const [urls, setUrls] = useState([]);
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const fetchHistory = async () => {
    if (session) {
      try {
        const { data, error } = await supabase
          .from('urls')
          .select('short_code, original_url')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setUrls(data || []);
      } catch (err) {
        console.error('Fetch history error:', err);
        setError('載入歷史記錄失敗');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [session]);

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
        body: JSON.stringify({ url: longUrl, customCode: customCode || undefined }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('API raw response:', text);
        throw new Error(`API request failed with status ${response.status}: ${text}`);
      }

      const data = await response.json();
      if (data.shortUrl) {
        setLongUrl(''); // 清空輸入
        setCustomCode(''); // 清空自訂短碼
        fetchHistory(); // 刷新歷史記錄
      } else {
        setError('縮短網址失敗：未收到短網址');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`縮短網址失敗：${err.message}`);
    }
  };

  if (!session) return <p className="text-center">請先登入以查看歷史記錄</p>;
  if (loading) return <p className="text-center">載入中...</p>;

  return (
    <div className="flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-4">短網址歷史記錄</h1>
        <div className="mb-6">
          <input
            type="text"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="輸入長網址"
            className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="自訂短碼（6位元，可選）"
            maxLength={6}
            className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleShorten}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            縮短
          </button>
          {error && <p className="mt-2 text-center text-red-500">{error}</p>}
        </div>
        {urls.length === 0 ? (
          <p className="text-center">尚無短網址記錄</p>
        ) : (
          <ul className="space-y-2">
            {urls.map((url) => (
              <li key={url.short_code} className="flex justify-between items-center">
                <a
                  href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/${url.short_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {`${process.env.NEXT_PUBLIC_SUPABASE_URL}/${url.short_code}`}
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