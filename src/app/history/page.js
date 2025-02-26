'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function History() {
  const [session, setSession] = useState(null);
  const [customUrls, setCustomUrls] = useState([]);
  const [regularUrls, setRegularUrls] = useState([]);
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
        // 查詢自定義短網址（假設 self_defined 為 true 或 customCode 不為 null）
        const { data: customData, error: customError } = await supabase
          .from('urls')
          .select('short_code, original_url')
          .eq('user_id', session.user.id)
          .is('custom_code', true) // 假設有 self_defined 欄位表示自定義
          .order('created_at', { ascending: false })
          .limit(1); // 只取最新的自定義記錄

        if (customError) throw customError;
        setCustomUrls(customData || []);

        // 查詢普通縮網址歷史記錄
        const { data: regularData, error: regularError } = await supabase
          .from('urls')
          .select('short_code, original_url')
          .eq('user_id', session.user.id)
          .is('custom_code', false) // 假設普通縮網址為非自定義
          .order('created_at', { ascending: false });

        if (regularError) throw regularError;
        setRegularUrls(regularData || []);
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

  const handleEditCustom = async () => {
    if (!longUrl || !customCode || customCode.length !== 6 || !/^[a-zA-Z0-9]+$/.test(customCode)) {
      setError('請輸入有效的 URL 和 6 位元字母或數字的自訂短碼');
      return;
    }

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl, customCode }),
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
        setError('更新自訂短網址失敗：未收到短網址');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`更新自訂短網址失敗：${err.message}`);
    }
  };

  if (!session) return <p className="text-center">請先登入以查看歷史記錄</p>;
  if (loading) return <p className="text-center">載入中...</p>;

  return (
    <div className="flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-4">短網址歷史記錄</h1>

        {/* 自定義短網址區塊 */}
        <div className="mb-6">
          {customUrls.length === 0 ? (
            <>
              <p className="text-center mb-4">尚未定義自訂短網址</p>
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
                placeholder="自訂短碼（6位元字母或數字）"
                maxLength={6}
                className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleShorten}
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                定義自訂短網址
              </button>
            </>
          ) : (
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-bold">自訂短網址：</p>
                <a
                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrls[0].short_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrls[0].short_code}`}
                </a>
                <span className="text-gray-600 ml-2">{customUrls[0].original_url}</span>
              </div>
              <button
                onClick={() => {
                  setLongUrl(customUrls[0].original_url);
                  setCustomCode(customUrls[0].short_code);
                }}
                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
              >
                編輯
              </button>
            </div>
          )}
          {error && <p className="mt-2 text-center text-red-500">{error}</p>}
        </div>

        {/* 普通縮網址歷史紀錄 */}
        <div>
          <h2 className="text-xl font-bold mb-2">縮網址歷史記錄</h2>
          {regularUrls.length === 0 ? (
            <p className="text-center">尚無縮網址記錄</p>
          ) : (
            <ul className="space-y-2">
              {regularUrls.map((url) => (
                <li key={url.short_code} className="flex justify-between items-center">
                  <a
                    href={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}
                  </a>
                  <span className="text-gray-600 truncate max-w-xs">{url.original_url}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}