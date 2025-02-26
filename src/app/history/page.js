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
        // 查詢自定義短網址（custom_code = true）
        const { data: customData, error: customError } = await supabase
          .from('urls')
          .select('short_code, original_url, title, created_at, click_count')
          .eq('user_id', session.user.id)
          .eq('custom_code', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (customError) throw customError;
        setCustomUrls(customData || []);

        // 查詢普通縮網址歷史記錄（custom_code = false）
        const { data: regularData, error: regularError } = await supabase
          .from('urls')
          .select('short_code, original_url, title, created_at, click_count')
          .eq('user_id', session.user.id)
          .eq('custom_code', false)
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
    if (customCode && (customCode.length !== 6 || !/^[a-zA-Z0-9]+$/.test(customCode))) {
      setError('自訂短碼必須為6位元字母或數字');
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
        const errorData = JSON.parse(text);
        setError(`縮短網址失敗：${errorData.error || '未知錯誤'}`);
        return;
      }

      const data = await response.json();
      if (data.shortUrl) {
        setLongUrl(''); // 清空輸入
        setCustomCode(''); // 清空自訂短碼
        await fetchHistory(); // 確保刷新數據
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
        const errorData = JSON.parse(text);
        setError(`更新自訂短網址失敗：${errorData.error || '未知錯誤'}`);
        return;
      }

      const data = await response.json();
      if (data.shortUrl) {
        setLongUrl(''); // 清空輸入
        setCustomCode(''); // 清空自訂短碼
        await fetchHistory(); // 確保刷新數據
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
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl"> {/* 放寬寬度 */}
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
                <p className="text-gray-600">
                  <a
                    href={customUrls[0].original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {customUrls[0].title || customUrls[0].original_url}
                  </a>
                </p>
                <p className="text-sm text-gray-500">
                  產生時間：{new Date(customUrls[0].created_at).toLocaleString('zh-TW', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).replace(/\//g, '/')}
                  ，點擊次數：{customUrls[0].click_count || 0}
                </p>
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

        {/* 普通縮網址歷史紀錄 - 表格形式 */}
        <div>
          <h2 className="text-xl font-bold mb-2">縮網址歷史記錄</h2>
          {regularUrls.length === 0 ? (
            <p className="text-center">尚無縮網址記錄</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-2">短網址</th>
                    <th className="border border-gray-300 p-2">標題</th>
                    <th className="border border-gray-300 p-2">產生時間</th>
                    <th className="border border-gray-300 p-2">點擊次數</th>
                  </tr>
                </thead>
                <tbody>
                  {regularUrls.map((url) => (
                    <tr key={url.short_code} className="hover:bg-gray-100">
                      <td className="border border-gray-300 p-2">
                        <a
                          href={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          {`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}
                        </a>
                      </td>
                      <td className="border border-gray-300 p-2">
                        <a
                          href={url.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          {url.title || url.original_url}
                        </a>
                      </td>
                      <td className="border border-gray-300 p-2">
                        {new Date(url.created_at).toLocaleString('zh-TW', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).replace(/\//g, '/')}
                      </td>
                      <td className="border border-gray-300 p-2">{url.click_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}