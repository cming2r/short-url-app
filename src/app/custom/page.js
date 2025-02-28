'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function CustomUrl() {
  const [session, setSession] = useState(null);
  const [customUrl, setCustomUrl] = useState(null);
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log('Client session in custom/page.js:', session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      console.log('Auth state changed in custom/page.js:', { event, session });
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchCustomUrl = async () => {
    if (session) {
      try {
        const { data, error } = await supabase
          .from('custom_urls')
          .select('short_code, original_url, title, created_at, click_count')
          .eq('user_id', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 表示無記錄
          throw error;
        }
        setCustomUrl(data || null);
      } catch (err) {
        console.error('Fetch custom URL error:', err);
        setError('載入自訂短網址失敗');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCustomUrl();
  }, [session]);

  const handleShorten = async () => {
    setError('');

    // 更嚴格的 URL 驗證
    let formattedUrl = longUrl.trim();
    if (!/^https?:\/\//.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl); // 驗證 URL 格式
    } catch (urlError) {
      setError('請輸入有效的 URL（例如 https://tw.yahoo.com/）');
      return;
    }

    if (customCode && (customCode.length !== 6 || !/^[a-zA-Z0-9]+$/.test(customCode))) {
      setError('自訂短碼必須為6位元字母或數字');
      return;
    }

    try {
      const userId = session?.user?.id || null;
      const accessToken = session?.access_token || null;
      console.log('User ID sent from custom/page.js:', userId);
      console.log('Access token sent from custom/page.js:', accessToken);

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl, customCode, userId, accessToken }),
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
        await fetchCustomUrl(); // 刷新自定義短網址
      } else {
        setError('縮短網址失敗：未收到短網址');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`縮短網址失敗：${err.message}`);
    }
  };

  const handleEditCustom = async () => {
    setError('');

    // 更嚴格的 URL 驗證
    let formattedUrl = longUrl.trim();
    if (!/^https?:\/\//.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl); // 驗證 URL 格式
    } catch (urlError) {
      setError('請輸入有效的 URL（例如 https://tw.yahoo.com/）');
      return;
    }

    if (customCode && (customCode.length !== 6 || !/^[a-zA-Z0-9]+$/.test(customCode))) {
      setError('請輸入有效的 URL 和 6 位元字母或數字的自訂短碼');
      return;
    }

    try {
      const userId = session?.user?.id || null;
      const accessToken = session?.access_token || null;
      console.log('User ID sent from custom/page.js (edit):', userId);
      console.log('Access token sent from custom/page.js (edit):', accessToken);

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl, customCode, userId, accessToken }),
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
        await fetchCustomUrl(); // 刷新自定義短網址
      } else {
        setError('更新自訂短網址失敗：未收到短網址');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`更新自訂短網址失敗：${err.message}`);
    }
  };

  if (!session) return <p className="text-center">請先登入以自定義短網址</p>;
  if (loading) return <p className="text-center">載入中...</p>;

  return (
    <div className="flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-4">自訂短網址</h1>

        {customUrl ? (
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="font-bold">自訂短網址：</p>
              <a
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`}
              </a>
              <p className="text-gray-600">
                <a
                  href={customUrl.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {customUrl.title || '無標題'}
                </a>
              </p>
              <p className="text-sm text-gray-500">
                產生時間：{new Date(customUrl.created_at).toLocaleString('zh-TW', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }).replace(/\//g, '/')}
                ，點擊次數：{customUrl.click_count || 0}
              </p>
            </div>
            <button
              onClick={() => {
                setLongUrl(customUrl.original_url);
                setCustomCode(customUrl.short_code);
              }}
              className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
            >
              編輯
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              placeholder="輸入長網址（如 https://tw.yahoo.com/）"
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
        )}
        {error && <p className="mt-2 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
}