'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function History() {
  const [session, setSession] = useState(null);
  const [customUrl, setCustomUrl] = useState(null);
  const [urls, setUrls] = useState([]);
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
        // 查詢自定義短網址（從 custom_urls 表）
        const { data: customData, error: customError } = await supabase
          .from('custom_urls')
          .select('short_code, original_url, title, created_at, click_count')
          .eq('user_id', session.user.id)
          .single();

        if (customError && customError.code !== 'PGRST116') { // PGRST116 表示無記錄
          throw customError;
        }
        setCustomUrl(customData || null);

        // 查詢普通縮網址歷史記錄（從 urls 表）
        const { data: regularData, error: regularError } = await supabase
          .from('urls')
          .select('short_code, original_url, title, created_at, click_count')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (regularError) throw regularError;
        setUrls(regularData || []);

        console.log('Custom URL data:', customData);
        console.log('Regular URLs data:', regularData);
      } catch (err) {
        console.error('Fetch history error:', err);
        setError('載入歷史記錄失敗: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [session]);

  if (!session) return <p className="text-center">請先登入以查看歷史記錄</p>;
  if (loading) return <p className="text-center">載入中...</p>;

  return (
    <div className="flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-4">歷史記錄</h1>

        {/* 自定義短網址區塊 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">自定義短網址</h2>
          {customUrl ? (
            <div className="overflow-hidden">
              <table className="w-full border-collapse border border-gray-300 table-fixed">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-2 w-[300px] text-center">短網址</th>
                    <th className="border border-gray-300 p-2 w-[300px] text-center">標題</th>
                    <th className="border border-gray-300 p-2 w-[150px] text-center">產生時間</th>
                    <th className="border border-gray-300 p-2 w-[100px] text-center">點擊次數</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2 truncate text-center" title={`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`}>
                      <a
                        href={`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`}
                      </a>
                    </td>
                    <td className="border border-gray-300 p-2 truncate text-center" title={customUrl.title || '無標題'}>
                      <a
                        href={customUrl.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {customUrl.title || '無標題'}
                      </a>
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {new Date(customUrl.created_at).toLocaleString('zh-TW', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      }).replace(/\//g, '/')}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">{customUrl.click_count || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center">尚未定義自訂短網址</p>
          )}
        </div>

        {/* 普通縮網址歷史記錄 */}
        <div>
          <h2 className="text-xl font-bold mb-2">縮網址歷史記錄</h2>
          {urls.length === 0 ? (
            <p className="text-center">尚無縮網址記錄</p>
          ) : (
            <div className="overflow-hidden">
              <table className="w-full border-collapse border border-gray-300 table-fixed">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-2 w-[300px] text-center">短網址</th>
                    <th className="border border-gray-300 p-2 w-[300px] text-center">標題</th>
                    <th className="border border-gray-300 p-2 w-[150px] text-center">產生時間</th>
                    <th className="border border-gray-300 p-2 w-[100px] text-center">點擊次數</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url) => (
                    <tr key={url.short_code} className="hover:bg-gray-100">
                      <td className="border border-gray-300 p-2 truncate text-center" title={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}>
                        <a
                          href={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          {`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}
                        </a>
                      </td>
                      <td className="border border-gray-300 p-2 truncate text-center" title={url.title || '無標題'}>
                        <a
                          href={url.original_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          {url.title || '無標題'}
                        </a>
                      </td>
                      <td className="border border-gray-300 p-2 text-center">
                        {new Date(url.created_at).toLocaleString('zh-TW', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        }).replace(/\//g, '/')}
                      </td>
                      <td className="border border-gray-300 p-2 text-center">{url.click_count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
}