'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Notification from '@/components/Notification';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function HistoryPageClient({ locale }) {
  const { changeLanguage, t } = useTranslation();
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [customUrl, setCustomUrl] = useState(null);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 分頁相關狀態
  const [currentPage, setCurrentPage] = useState(1);
  const urlsPerPage = 15; // 每頁顯示15條記錄

  // 設定語言
  useEffect(() => {
    changeLanguage(locale);
  }, [changeLanguage, locale]);

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
        const userId = session.user.id;
        console.log('Fetching history for user:', userId);
        
        // 查詢自定義短網址（從 custom_urls 表）
        const { data: customData, error: customError } = await supabase
          .from('custom_urls')
          .select('short_code, original_url, title, created_at, click_count, user_id')
          .eq('user_id', userId)
          .single();

        if (customError && customError.code !== 'PGRST116') { // PGRST116 表示無記錄
          throw customError;
        }
        setCustomUrl(customData || null);

        // 查詢普通縮網址歷史記錄（從 urls 表）
        const { data: regularData, error: regularError } = await supabase
          .from('urls')
          .select('short_code, original_url, title, created_at, click_count, user_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (regularError) throw regularError;
        
        console.log(`Found ${regularData?.length || 0} regular URLs for user:`, userId);
        
        // 嘗試另一種方法搜索urls，不使用eq而是使用like來檢查
        if ((!regularData || regularData.length === 0) && userId) {
          console.log('No URLs found with exact match, trying broader search');
          const { data: allUrls, error: allUrlsError } = await supabase
            .from('urls')
            .select('short_code, original_url, title, created_at, click_count, user_id');
            
          if (!allUrlsError && allUrls && allUrls.length > 0) {
            console.log('Found URLs in database:', allUrls.length);
            
            // 檢查有多少URL有用戶ID
            const urlsWithUserId = allUrls.filter(url => url.user_id);
            console.log('URLs with any user_id:', urlsWithUserId.length);
            
            // 檢查是否有匹配當前用戶的URL
            const matchingUrls = allUrls.filter(url => 
              url.user_id && url.user_id.toString() === userId.toString()
            );
            console.log('URLs matching current user:', matchingUrls.length);
          }
        }
        
        setUrls(regularData || []);
        console.log('Custom URL data:', customData);
        console.log('Regular URLs data:', regularData);
      } catch (err) {
        console.error('Fetch history error:', err);
        setError(t.errors?.loadError || '載入歷史記錄失敗: ' + err.message);
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
          message: t.history?.copySuccess || '已複製短網址到剪貼簿！',
          type: 'success'
        });
      })
      .catch(err => {
        console.error('複製失敗:', err);
        setNotification({
          message: t.history?.copyError || '複製短網址失敗',
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
    
    if (!confirm(t.history?.deleteConfirm || '確定要刪除此短網址嗎？')) {
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
        message: t.history?.deleteSuccess || '短網址已成功刪除',
        type: 'success'
      });
      
      // 重新加載數據
      await fetchHistory();
    } catch (err) {
      console.error('刪除短網址出錯:', err);
      setNotification({
        message: `${t.history?.deleteError || '刪除短網址失敗:'} ${err.message}`,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h1 className="text-2xl font-bold text-center mb-4">{t.history?.title || '歷史記錄'}</h1>

            {!session ? (
              <>
                <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-lg font-medium text-blue-800 mb-4">{t.history?.loginRequired || 'Please login to view your URL history'}</p>
                  
                  {/* 介紹區塊 - 現代風格 */}
                  <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">{t.history?.featureTitle || 'URL History Features'}</h2>
                    <p className="text-gray-600 mb-6">{t.history?.featureDescription || 'Track and manage all your shortened URLs in one convenient dashboard.'}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                      <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-blue-500 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </div>
                        <h3 className="font-bold text-center mb-2">{t.history?.completeHistory?.title || 'Complete History'}</h3>
                        <p className="text-sm">{t.history?.completeHistory?.description || 'Access all your shortened URLs in one place, sorted by creation date.'}</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-green-500 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                          </svg>
                        </div>
                        <h3 className="font-bold text-center mb-2">{t.history?.analytics?.title || 'Analytics'}</h3>
                        <p className="text-sm">{t.history?.analytics?.description || 'Track engagement with click counts for each of your shortened URLs.'}</p>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-purple-500 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <h3 className="font-bold text-center mb-2">{t.history?.urlManagement?.title || 'URL Management'}</h3>
                        <p className="text-sm">{t.history?.urlManagement?.description || 'Copy and delete your URLs with easy one-click actions.'}</p>
                      </div>
                    </div>
                    
                    <div className="mt-8 bg-blue-100 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">{t.history?.benefits?.title || 'Benefits of URL History Tracking'}</h3>
                      <ul className="text-sm text-left list-disc pl-5 space-y-1">
                        {t.history?.benefits?.points ? (
                          t.history.benefits.points.map((point, index) => (
                            <li key={index}>{point}</li>
                          ))
                        ) : (
                          <>
                            <li>Keep track of all shortened URLs you've created</li>
                            <li>Monitor which links generate the most engagement</li>
                            <li>Easily access your most important links</li>
                            <li>Delete outdated links that are no longer needed</li>
                            <li>See the title and original URL for each shortened link</li>
                          </>
                        )}
                      </ul>
                    </div>
                    
                    <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-green-800 mb-2">{t.history?.proTip?.title || 'Pro Tip'}</h3>
                      <p className="text-sm">{t.history?.proTip?.description || 'Login once and all your shortened URLs will be automatically saved to your history, allowing you to track their performance over time.'}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : loading ? (
              <p className="text-center">{t.common?.loading || '載入中...'}</p>
            ) : (
              <>
                {/* 自定義短網址區塊 */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-2">{t.history?.customUrlTitle || '自訂短網址'}</h2>
                  {customUrl ? (
                    <div className="overflow-hidden">
                      <table className="w-full border-collapse border border-gray-300 table-fixed">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2 w-[280px] text-center">{t.history?.urlColumn || '短網址'}</th>
                            <th className="border border-gray-300 p-2 w-[260px] text-center">{t.history?.titleColumn || '標題'}</th>
                            <th className="border border-gray-300 p-2 w-[150px] text-center">{t.history?.createdAtColumn || '產生時間'}</th>
                            <th className="border border-gray-300 p-2 w-[80px] text-center">{t.history?.clickCountColumn || '點擊次數'}</th>
                            <th className="border border-gray-300 p-2 w-[80px] text-center">{t.history?.actionsColumn || '操作'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="hover:bg-gray-100 slide-in" data-short-code={customUrl.short_code}>
                            <td className="border border-gray-300 p-2 text-center relative">
                              <div className="max-w-[260px] mx-auto truncate">
                                <a
                                  href={`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline"
                                  title={`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`}
                                >
                                  {`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`}
                                </a>
                              </div>
                              <button 
                                onClick={(e) => handleCopy(`${process.env.NEXT_PUBLIC_BASE_URL}/${customUrl.short_code}`, e)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 bg-white rounded-full p-1"
                                title={t.history?.copyTooltip || '複製短網址'}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                              </button>
                            </td>
                            <td className="border border-gray-300 p-2 truncate text-center" title={customUrl.title || (t.custom?.noTitle || '無標題')}>
                              <a
                                href={customUrl.original_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 underline"
                              >
                                {customUrl.title || (t.custom?.noTitle || '無標題')}
                              </a>
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {typeof window !== 'undefined' ? 
                                new Date(customUrl.created_at).toLocaleString(locale === 'en' ? 'en-US' : 'zh-TW', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }).replace(/\//g, '/') :
                                new Date(customUrl.created_at).toISOString().split('T')[0]
                              }
                            </td>
                            <td className="border border-gray-300 p-2 text-center">{customUrl.click_count || 0}</td>
                            <td className="border border-gray-300 p-2 text-center">
                              <button 
                                onClick={(e) => handleDelete(customUrl.short_code, true, e)}
                                className="text-red-500 hover:text-red-700"
                                title={t.history?.deleteTooltip || '刪除短網址'}
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
                    <p className="text-center">{t.history?.noCustomUrl || '尚未定義自訂短網址'}</p>
                  )}
                </div>

                {/* 普通縮網址歷史記錄 */}
                <div>
                  <h2 className="text-xl font-bold mb-2">{t.history?.historyTitle || '縮網址歷史記錄'}</h2>
                  {urls.length === 0 ? (
                    <p className="text-center">{t.history?.noHistory || '尚無縮網址記錄'}</p>
                  ) : (
                    <div className="overflow-hidden">
                      <table className="w-full border-collapse border border-gray-300 table-fixed">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border border-gray-300 p-2 w-[280px] text-center">{t.history?.urlColumn || '短網址'}</th>
                            <th className="border border-gray-300 p-2 w-[260px] text-center">{t.history?.titleColumn || '標題'}</th>
                            <th className="border border-gray-300 p-2 w-[150px] text-center">{t.history?.createdAtColumn || '產生時間'}</th>
                            <th className="border border-gray-300 p-2 w-[80px] text-center">{t.history?.clickCountColumn || '點擊次數'}</th>
                            <th className="border border-gray-300 p-2 w-[80px] text-center">{t.history?.actionsColumn || '操作'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* 計算當前頁面應該顯示的項目 */}
                          {urls
                            .slice((currentPage - 1) * urlsPerPage, currentPage * urlsPerPage)
                            .map((url, index) => (
                            <tr key={url.short_code} className="hover:bg-gray-100 slide-in" data-short-code={url.short_code} style={{animationDelay: `${index * 0.05}s`}}>
                              <td className="border border-gray-300 p-2 text-center relative">
                                <div className="max-w-[260px] mx-auto truncate">
                                  <a
                                    href={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                    title={`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}
                                  >
                                    {`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`}
                                  </a>
                                </div>
                                <button 
                                  onClick={(e) => handleCopy(`${process.env.NEXT_PUBLIC_BASE_URL}/${url.short_code}`, e)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-500 bg-white rounded-full p-1"
                                  title={t.history?.copyTooltip || '複製短網址'}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                </button>
                              </td>
                              <td className="border border-gray-300 p-2 truncate text-center" title={url.title || (t.custom?.noTitle || '無標題')}>
                                <a
                                  href={url.original_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline"
                                >
                                  {url.title || (t.custom?.noTitle || '無標題')}
                                </a>
                              </td>
                              <td className="border border-gray-300 p-2 text-center">
                                {typeof window !== 'undefined' ? 
                                  new Date(url.created_at).toLocaleString(locale === 'en' ? 'en-US' : 'zh-TW', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }).replace(/\//g, '/') :
                                  new Date(url.created_at).toISOString().split('T')[0]
                                }
                              </td>
                              <td className="border border-gray-300 p-2 text-center">{url.click_count || 0}</td>
                              <td className="border border-gray-300 p-2 text-center">
                                <button 
                                  onClick={(e) => handleDelete(url.short_code, false, e)}
                                  className="text-red-500 hover:text-red-700"
                                  title={t.history?.deleteTooltip || '刪除短網址'}
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
                  
                  {/* 分頁控制 */}
                  {urls.length > urlsPerPage && (
                    <div className="flex justify-center mt-4">
                      <nav className="flex items-center">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 bg-gray-200 rounded-l border border-gray-300 disabled:opacity-50"
                        >
                          &laquo; {t.common?.previous || '上一頁'}
                        </button>
                        
                        <div className="px-4 py-1 border-t border-b border-gray-300 bg-white">
                          {t.common?.page || '頁'} {currentPage} / {Math.ceil(urls.length / urlsPerPage)}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(urls.length / urlsPerPage)))}
                          disabled={currentPage >= Math.ceil(urls.length / urlsPerPage)}
                          className="px-3 py-1 bg-gray-200 rounded-r border border-gray-300 disabled:opacity-50"
                        >
                          {t.common?.next || '下一頁'} &raquo;
                        </button>
                      </nav>
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
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}