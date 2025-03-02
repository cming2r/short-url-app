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
  const [isEditing, setIsEditing] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false); // 新增狀態追蹤是否生成

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
        setIsGenerated(!!data); // 如果有自定義短網址，表示已生成
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
    if (!longUrl || !/^https?:\/\//.test(longUrl)) {
      setError('請輸入有效的 URL（需包含 http:// 或 https://）');
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
        body: JSON.stringify({ url: longUrl, customCode, userId, accessToken }),
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
        setIsGenerated(true); // 標記已生成
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
    if (!longUrl || !/^https?:\/\//.test(longUrl)) {
      setError('請輸入有效的 URL（需包含 http:// 或 https://）');
      return;
    }

    if (!customCode || customCode.length !== 6 || !/^[a-zA-Z0-9]+$/.test(customCode)) {
      setError('請輸入有效的 URL 和 6 位元字母或數字的自訂短碼');
      return;
    }

    try {
      // 檢查新短碼是否已被使用（排除當前記錄的短碼）
      if (customCode !== customUrl.short_code) {
        const { data: existingCode, error: codeError } = await supabase
          .from('custom_urls')
          .select('short_code')
          .eq('short_code', customCode)
          .single();

        if (codeError && codeError.code !== 'PGRST116') {
          throw codeError;
        }
        if (existingCode) {
          setError('自訂短碼已被使用');
          return;
        }
      }

      // 自定義 fetchTitle 函數，統一適用於所有網站
      async function fetchTitle(url) {
        try {
          const response = await fetch(url, { timeout: 5000, redirect: 'follow' });
          const html = await response.text();
          const titleMatch = html.match(/<title>(.*?)<\/title>/i);
          if (!titleMatch) return url;

          let title = titleMatch[1].trim();
          // 移除多餘的空白字符
          title = title.replace(/^\s*|\s*$/g, '').replace(/\s+/g, ' ');
          // 限制標題長度，避免過長
          return title.length > 50 ? title.substring(0, 50) + '...' : title;
        } catch (error) {
          console.error('Failed to fetch title:', error);
          return url; // 回傳原始 URL 作為預設標題
        }
      }

      const title = await fetchTitle(longUrl);
      console.log('Fetched title for editing:', title);

      // 更新現有自定義短網址記錄
      const { error } = await supabase
        .from('custom_urls')
        .update({
          short_code: customCode,
          original_url: longUrl,
          title: title,
          created_at: new Date().toISOString(),
        })
        .eq('user_id', session.user.id)
        .eq('short_code', customUrl.short_code);

      if (error) {
        console.error('Error updating custom URL:', error);
        throw error;
      }

      console.log('Custom URL updated successfully:', { shortCode: customCode, original_url: longUrl, title });
      setLongUrl('');
      setCustomCode('');
      setIsEditing(false); // 提交後退出編輯模式
      setIsGenerated(true); // 標記已生成
      await fetchCustomUrl();
    } catch (err) {
      console.error('Update error:', err);
      setError(`更新自訂短網址失敗：${err.message}`);
    }
  };

  if (!session) return <p className="text-center">請先登入以自定義短網址</p>;
  if (loading) return <p className="text-center">載入中...</p>;

  return (
    <div className="flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center mb-4">自訂短網址</h1>

        {customUrl && !isEditing ? (
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
                setIsEditing(true); // 進入編輯模式
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
              onClick={customUrl ? handleEditCustom : handleShorten}
              className={`w-full p-2 rounded text-white ${
                isGenerated ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-800 hover:bg-gray-900'
              }`}
            >
              {customUrl ? '提交編輯' : '定義自訂短網址'}
            </button>
            {customUrl && (
              <button
                onClick={() => {
                  setLongUrl('');
                  setCustomCode('');
                  setIsEditing(false); // 取消編輯
                }}
                className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600 mt-2"
              >
                取消
              </button>
            )}
          </>
        )}
        {error && <p className="mt-2 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
}