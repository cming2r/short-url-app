'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function History() {
  const [session, setSession] = useState(null);
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
        const { data, error } = await supabase
          .from('urls')
          .select('short_code, original_url, title, created_at, click_count')
          .eq('user_id', session.user.id)
          .eq('custom_code', false) // 僅顯示普通縮網址
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

  if (!session) return <p className="text-center">請先登入以查看歷史記錄</p>;
  if (loading) return <p className="text-center">載入中...</p>;

  return (
    <div className="flex items-center justify-center bg-gray-100 py-8">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl"> {/* 放寬寬度 */}
        <h1 className="text-2xl font-bold text-center mb-4">縮網址歷史記錄</h1>

        {urls.length === 0 ? (
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
                {urls.map((url) => (
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
                        {url.title || '無標題'}
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
        {error && <p className="mt-2 text-center text-red-500">{error}</p>}
      </div>
    </div>
  );
}