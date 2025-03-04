'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Notification from '@/components/Notification';

export default function History() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [customUrl, setCustomUrl] = useState(null);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
  
  // 顯示通知的狀態
  const [notification, setNotification] = useState(null);
  
  // 複製短網址到剪貼簿
  const handleCopy = (shortUrl, event) => {
    // 添加脈動動畫效果到按鈕
    if (event && event.currentTarget) {
      event.currentTarget.classList.add('pulse');
      // 動畫結束後移除類，以便下次點擊時再次觸發
      setTimeout(() => {
        event.currentTarget.classList.remove('pulse');
      }, 400);
    }
    
    navigator.clipboard.writeText(shortUrl)
      .then(() => {
        // 使用通知組件
        setNotification({
          message: '已複製短網址到剪貼簿！',
          type: 'success'
        });
      })
      .catch(err => {
        console.error('複製失敗:', err);
        setNotification({
          message: '複製短網址失敗',
          type: 'error'
        });
      });
  };
  
  // 刪除短網址
  const handleDelete = async (shortCode, isCustom = false, event) => {
    // 添加震動動畫效果到按鈕
    if (event && event.currentTarget) {
      event.currentTarget.classList.add('shake');
      setTimeout(() => {
        event.currentTarget.classList.remove('shake');
      }, 400);
    }
    
    if (!confirm('確定要刪除此短網址嗎？')) {
      return;
    }
    
    try {
      setLoading(true);
      const table = isCustom ? 'custom_urls' : 'urls';
      
      // 找到要刪除的行並添加淡出動畫
      const row = document.querySelector(`tr[data-short-code="${shortCode}"]`);
      if (row) {
        row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
      }
      
      // 延遲刪除操作以便動畫有時間顯示
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('short_code', shortCode)
        .eq('user_id', session.user.id);
      
      if (deleteError) throw deleteError;
      
      // 使用通知組件
      setNotification({
        message: '短網址已成功刪除',
        type: 'success'
      });
      
      // 重新加載數據
      await fetchHistory();
    } catch (err) {
      console.error('刪除短網址出錯:', err);
      setNotification({
        message: `刪除短網址失敗: ${err.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

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
                    <th className="border border-gray-300 p-2 w-[280px] text-center">短網址</th>
                    <th className="border border-gray-300 p-2 w-[260px] text-center">標題</th>
                    <th className="border border-gray-300 p-2 w-[150px] text-center">產生時間</th>
                    <th className="border border-gray-300 p-2 w-[80px] text-center">點擊次數</th>
                    <th className="border border-gray-300 p-2 w-[80px] text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-100 slide-in" data-short-code={customUrl.short_code}>
                    <td className="border border-gray-300 p-2 truncate text-center" title={`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`}>
                      <div className="flex items-center space-x-1 justify-center">
                        <a
                          href={`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 underline"
                        >
                          {`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`}
                        </a>
                        <button 
                          onClick={(e) => handleCopy(`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`, e)}
                          className="ml-1 text-gray-500 hover:text-blue-500"
                          title="複製短網址"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </div>
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
                    <td className="border border-gray-300 p-2 text-center">
                      <button 
                        onClick={(e) => handleDelete(customUrl.short_code, true, e)}
                        className="text-red-500 hover:text-red-700"
                        title="刪除短網址"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
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
                    <th className="border border-gray-300 p-2 w-[280px] text-center">短網址</th>
                    <th className="border border-gray-300 p-2 w-[260px] text-center">標題</th>
                    <th className="border border-gray-300 p-2 w-[150px] text-center">產生時間</th>
                    <th className="border border-gray-300 p-2 w-[80px] text-center">點擊次數</th>
                    <th className="border border-gray-300 p-2 w-[80px] text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((url, index) => (
                    <tr key={url.short_code} className="hover:bg-gray-100 slide-in" data-short-code={url.short_code} style={{animationDelay: `${index * 0.05}s`}}>
                      <td className="border border-gray-300 p-2 truncate text-center" title={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}>
                        <div className="flex items-center space-x-1 justify-center">
                          <a
                            href={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 underline"
                          >
                            {`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}
                          </a>
                          <button 
                            onClick={(e) => handleCopy(`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`, e)}
                            className="ml-1 text-gray-500 hover:text-blue-500"
                            title="複製短網址"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                          </button>
                        </div>
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
                      <td className="border border-gray-300 p-2 text-center">
                        <button 
                          onClick={(e) => handleDelete(url.short_code, false, e)}
                          className="text-red-500 hover:text-red-700"
                          title="刪除短網址"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {error && <p className="mt-2 text-center text-red-500 shake">{error}</p>}
        {successMessage && <p className="mt-2 text-center text-green-500 bounce-in">{successMessage}</p>}
        
        {/* 使用新的通知組件 */}
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
      </div>
    </div>
  );
}