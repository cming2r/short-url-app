'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CustomUrlPageClient({ locale }) {
  const { changeLanguage, t } = useTranslation();
  const [session, setSession] = useState(null);
  const [customUrl, setCustomUrl] = useState(null);
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false); // 新增編輯模式狀態

  // 設定語言
  useEffect(() => {
    changeLanguage(locale);
  }, [changeLanguage, locale]);

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
        setError(t.errors?.loadError || '載入自訂短網址失敗');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // 刪除自定義短網址
  const handleDeleteCustomUrl = async (shortCode) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('custom_urls')
        .delete()
        .eq('short_code', shortCode)
        .eq('user_id', session.user.id);
        
      if (error) throw error;
      
      // 清除當前顯示的自定義短網址
      setCustomUrl(null);
      setError('');
      
      // 顯示成功消息
      alert(t.history?.deleteSuccess || '短網址已成功刪除');
      
    } catch (err) {
      console.error('刪除自定義短網址出錯:', err);
      setError(t.history?.deleteError || '刪除短網址失敗:' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomUrl();
  }, [session]);

  const handleShorten = async () => {
    setError('');
    if (!longUrl || !/^https?:\/\//.test(longUrl)) {
      setError(t.errors?.invalidUrl || '請輸入有效的 URL（需包含 http:// 或 https://）');
      return;
    }
    // 檢查自訂短碼是否符合新要求：4-5個字符，必須包含至少一個字母和一個數字
    if (customCode) {
      const isValidLength = customCode.length >= 4 && customCode.length <= 5;
      const hasLetter = /[a-zA-Z]/.test(customCode);
      const hasNumber = /[0-9]/.test(customCode);
      const isValidChars = /^[a-zA-Z0-9]+$/.test(customCode);
      
      if (!isValidLength || !hasLetter || !hasNumber || !isValidChars) {
        setError(t.errors?.invalidCustomCode || '自訂短碼必須為4-5位元，且至少包含一個字母及一個數字');
        return;
      }
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
        setError(`${t.errors?.shortenFailed || '縮短網址失敗'}：${errorData.error || t.errors?.serverError || '未知錯誤'}`);
        return;
      }

      const data = await response.json();
      if (data.shortUrl) {
        setLongUrl(''); // 清空輸入
        setCustomCode(''); // 清空自訂短碼
        await fetchCustomUrl(); // 刷新自定義短網址
      } else {
        setError(t.errors?.shortenFailed || '縮短網址失敗：未收到短網址');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`${t.errors?.shortenFailed || '縮短網址失敗'}：${err.message}`);
    }
  };

  const handleEditCustom = async () => {
    setError('');
    if (!longUrl || !/^https?:\/\//.test(longUrl)) {
      setError(t.errors?.invalidUrl || '請輸入有效的 URL（需包含 http:// 或 https://）');
      return;
    }

    // 檢查自訂短碼是否符合新要求：4-5個字符，必須包含至少一個字母和一個數字
    if (!customCode) {
      setError(t.errors?.invalidCustomCode || '請輸入自訂短碼');
      return;
    }
    
    const isValidLength = customCode.length >= 4 && customCode.length <= 5;
    const hasLetter = /[a-zA-Z]/.test(customCode);
    const hasNumber = /[0-9]/.test(customCode);
    const isValidChars = /^[a-zA-Z0-9]+$/.test(customCode);
    
    if (!isValidLength || !hasLetter || !hasNumber || !isValidChars) {
      setError(t.errors?.invalidCustomCode || '自訂短碼必須為4-5位元，且至少包含一個字母及一個數字');
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
          setError(t.errors?.codeInUse || '自訂短碼已被使用');
          return;
        }
      }

      // 通過後端API獲取標題，避免瀏覽器同源策略限制
      async function fetchTitle(url) {
        try {
          console.log('通過API獲取標題:', url);
          
          const response = await fetch('/api/fetch-title', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
          });
          
          if (!response.ok) {
            throw new Error(`API返回狀態錯誤: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.error) {
            console.warn('獲取標題API返回錯誤:', data.error);
          }
          
          // 即使API返回錯誤，也應該有fallback標題
          return data.title || url;
        } catch (error) {
          console.error('獲取標題失敗:', error);
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
      await fetchCustomUrl();
    } catch (err) {
      console.error('Update error:', err);
      setError(`${t.errors?.updateError || '更新自訂短網址失敗'}：${err.message}`);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4">
        <div className="flex items-center justify-center py-8">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <h1 className="text-2xl font-bold text-center mb-4">{t.custom?.title || '自訂短網址'}</h1>

            {!session ? (
              <p className="text-center">{t.custom?.loginRequired || '請先登入以自定義短網址'}</p>
            ) : loading ? (
              <p className="text-center">{t.common?.loading || '載入中...'}</p>
            ) : (
              <>
                {customUrl && !isEditing ? (
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="font-bold">{t.custom?.yourCustomUrl || '自訂短網址：'}</p>
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
                          {customUrl.title || t.custom?.noTitle || '無標題'}
                        </a>
                      </p>
                      <p className="text-sm text-gray-500">
                        {t.custom?.createdAt || '產生時間'}：{typeof window !== 'undefined' ? 
                          new Date(customUrl.created_at).toLocaleString(locale === 'en' ? 'en-US' : 'zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).replace(/\//g, '/') : 
                          new Date(customUrl.created_at).toISOString().split('T')[0]
                        }
                        ，{t.custom?.clickCount || '點擊次數'}：{customUrl.click_count || 0}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setLongUrl(customUrl.original_url);
                          setCustomCode(customUrl.short_code);
                          setIsEditing(true); // 進入編輯模式
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        {t.custom?.edit || '編輯'}
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(t.history?.deleteConfirm || '確定要刪除此短網址嗎？')) {
                            handleDeleteCustomUrl(customUrl.short_code);
                          }
                        }}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600 flex items-center justify-center"
                        title={t.history?.deleteTooltip || '刪除短網址'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      value={longUrl}
                      onChange={(e) => setLongUrl(e.target.value)}
                      placeholder={t.custom?.longUrlPlaceholder || '輸入長網址'}
                      className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      placeholder={t.custom?.customCodePlaceholder || '自訂短碼（4-5位元，至少1字母及1數字）'}
                      maxLength={5}
                      className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={customUrl ? handleEditCustom : handleShorten}
                      className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                      {customUrl ? (t.custom?.updateButton || '提交編輯') : (t.custom?.createButton || '定義自訂短網址')}
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
                        {t.common?.cancel || '取消'}
                      </button>
                    )}
                  </>
                )}
                {error && <p className="mt-2 text-center text-red-500">{error}</p>}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}