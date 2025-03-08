'use client';

import { useTranslation } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

// Client 端元件，接收已處理的 locale 參數
export default function HomePage({ locale }) {
  const { changeLanguage, t } = useTranslation();
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [session, setSession] = useState(null);
  
  // 獲取查詢參數，用於處理 OAuth 登入回調
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  
  // 設定語言
  useEffect(() => {
    changeLanguage(locale);
  }, [changeLanguage, locale]);
  
  // 處理 Google 登入回調
  useEffect(() => {
    // 初始化獲取 session
    const getInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    
    getInitialSession();
    
    // 監聽身份驗證狀態變化
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, Boolean(session));
      setSession(session);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // 簡化 OAuth 回調處理，避免與 SupabaseProvider 衝突
  useEffect(() => {
    if (code) {
      console.log('HomePage detected OAuth callback code:', code);
      // 不再在這裡處理 OAuth 回調和頁面重整
      // 因為 SupabaseProvider 已經負責了這部分邏輯
      // 這樣可以避免兩個組件同時嘗試處理 OAuth 回調導致的重載循環
      
      // 只進行會話檢查，不觸發頁面重整
      const checkSession = async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            console.log('HomePage: Session found after OAuth redirect');
            setSession(data.session);
          }
        } catch (error) {
          console.error('HomePage: Error checking session:', error);
        }
      };
      
      checkSession();
    }
  }, [code]);
  
  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setCopied(false);
    
    if (!url || !/^https?:\/\//.test(url)) {
      setError(t.errors?.invalidUrl || '請輸入有效的 URL（需包含 http:// 或 https://）');
      return;
    }
    
    setLoading(true);
    
    try {
      // 如果有登入，加入用戶 ID 和 token
      const userId = session?.user?.id || null;
      let accessToken = null;
      
      // 確保獲取正確的access token
      if (session) {
        try {
          // 直接從session獲取token
          accessToken = session.access_token;
          
          // 如果session中沒有token，嘗試從supabase獲取
          if (!accessToken) {
            console.log('No token in session, attempting to get fresh token');
            const { data } = await supabase.auth.getSession();
            accessToken = data.session?.access_token;
          }
        } catch (tokenError) {
          console.error('Error getting access token:', tokenError);
        }
      }
      
      console.log('Shortening URL with user info:', { 
        isLoggedIn: !!session, 
        hasUserId: !!userId,
        hasToken: !!accessToken,
        userId: userId,
        sessionDetails: session ? {
          userId: session.user?.id,
          hasUser: !!session.user,
          email: session.user?.email
        } : null
      });
      
      // 確保我們有一個實際的userId值
      if (!userId && session?.user?.id) {
        console.log('Using session.user.id as userId was null');
        userId = session.user.id;
      }
      
      // 添加請求時間戳，避免緩存問題
      const timestamp = new Date().getTime();
      
      const requestData = { 
        url,
        userId,  // 添加用戶 ID
        accessToken,  // 添加訪問 token
        _t: timestamp  // 添加時間戳防止緩存
      };
      
      console.log('Sending shorten request with data:', {
        url: url,
        userId: userId,
        hasAccessToken: !!accessToken
      });
      
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t.errors?.shortenFailed || '縮短網址失敗');
      }
      
      const data = await response.json();
      setShortUrl(data.shortUrl);
      setUrl(''); // Clear input
    } catch (err) {
      console.error('Error shortening URL:', err);
      setError(err.message || t.errors?.shortenFailed || '縮短網址失敗');
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-10">
          <h1 className="text-3xl font-bold mb-8">{t.home?.title || 'URL Shortener'}</h1>
          <div className="w-full max-w-lg">
            <p className="text-center mb-6">{t.home?.subtitle || 'Shorten your URLs easily and quickly'}</p>
            
            <form onSubmit={handleShorten} className="mb-8">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder={t.home?.urlPlaceholder || "Enter a long URL"}
                  className="flex-grow p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {loading ? t.home?.processing || 'Processing...' : t.home?.shortenButton || 'Shorten URL'}
                </button>
              </div>
              {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
            
            {shortUrl && (
              <div className="bg-gray-100 p-4 rounded">
                <h3 className="font-bold mb-2">{t.home?.shortUrlLabel || 'Your shortened URL:'}</h3>
                <div className="mb-3 flex items-center">
                  <a 
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline text-lg break-all mr-2"
                  >
                    {shortUrl}
                  </a>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(shortUrl);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="ml-1 text-gray-500 hover:text-blue-500 p-1"
                    title={t.history?.copyTooltip || '複製短網址'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                  {copied && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2 animate-pulse">
                      {t.home?.copied || 'Copied!'}
                    </span>
                  )}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                >
                  {copied ? t.home?.copied || 'Copied!' : t.home?.copyButton || 'Copy'}
                </button>
              </div>
            )}
          </div>
          
          {!shortUrl && (
            <div className="mt-10 w-full max-w-5xl mx-auto">
              {/* 特色功能區 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-blue-500 mb-4 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                      <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">{t.home?.features?.fast?.title || '快速縮短'}</h3>
                  <p className="text-gray-600">{t.home?.features?.fast?.description || '即時生成短網址，無需等待。使用優化算法生成簡短的URL。'}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-green-500 mb-4 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">{t.home?.features?.secure?.title || '安全可靠'}</h3>
                  <p className="text-gray-600">{t.home?.features?.secure?.description || '所有鏈接都經過驗證，確保安全。網址永不過期，除非閒置太久。'}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="text-purple-500 mb-4 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                      <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                      <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">{t.home?.features?.custom?.title || '自定義短網址'}</h3>
                  <p className="text-gray-600">{t.home?.features?.custom?.description || '登入後享有更多功能，包括自定義短網址、使用統計及歷史記錄。'}</p>
                </div>
              </div>
              
              {/* 使用步驟區 */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-center mb-8">{t.home?.howTo?.title || '如何使用'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-4">1</div>
                    <h3 className="font-bold mb-2">{t.home?.howTo?.steps?.[0]?.title || '輸入長網址'}</h3>
                    <p className="text-sm text-gray-600">{t.home?.howTo?.steps?.[0]?.description || '在上方輸入框中粘貼您想要縮短的網址。'}</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-4">2</div>
                    <h3 className="font-bold mb-2">{t.home?.howTo?.steps?.[1]?.title || '點擊縮短按鈕'}</h3>
                    <p className="text-sm text-gray-600">{t.home?.howTo?.steps?.[1]?.description || '系統將立即為您生成一個簡短的網址。'}</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-4">3</div>
                    <h3 className="font-bold mb-2">{t.home?.howTo?.steps?.[2]?.title || '複製並分享'}</h3>
                    <p className="text-sm text-gray-600">{t.home?.howTo?.steps?.[2]?.description || '點擊複製按鈕，然後分享短網址。'}</p>
                  </div>
                  <div className="text-center p-4">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-4">4</div>
                    <h3 className="font-bold mb-2">{t.home?.howTo?.steps?.[3]?.title || '登入獲取更多功能'}</h3>
                    <p className="text-sm text-gray-600">{t.home?.howTo?.steps?.[3]?.description || '登入後可以查看點擊統計和創建自定義短網址。'}</p>
                  </div>
                </div>
              </div>
              
              {/* FAQ 區域 */}
              <div className="bg-gray-50 p-6 rounded-lg mb-12">
                <h2 className="text-2xl font-bold mb-6 text-center">{t.home?.faq?.title || '常見問題'}</h2>
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-bold mb-2">{t.home?.faq?.q1 || '這項服務是否免費？'}</h3>
                    <p className="text-gray-600">{t.home?.faq?.a1 || '是的，我們的短網址服務完全免費使用，沒有隱藏費用。'}</p>
                  </div>
                  <div className="border-b pb-4">
                    <h3 className="font-bold mb-2">{t.home?.faq?.q2 || '短網址有效期多久？'}</h3>
                    <p className="text-gray-600">{t.home?.faq?.a2 || '短網址沒有固定的到期時間，只要定期被訪問，就會永久有效。'}</p>
                  </div>
                  <div className="border-b pb-4">
                    <h3 className="font-bold mb-2">{t.home?.faq?.q3 || '我可以自訂短碼嗎？'}</h3>
                    <p className="text-gray-600">{t.home?.faq?.a3 || '可以，登入後您可以創建自定義短碼，但需要遵循4-5位元，且至少包含一個字母及一個數字的規則。'}</p>
                  </div>
                  <div className="border-b pb-4">
                    <h3 className="font-bold mb-2">{t.home?.faq?.q4 || '我可以查看我的短網址被點擊的次數嗎？'}</h3>
                    <p className="text-gray-600">{t.home?.faq?.a4 || '可以，登入用戶可以在歷史記錄中查看每個短網址的點擊次數和最後點擊時間。'}</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">{t.home?.faq?.q5 || '如何刪除我創建的短網址？'}</h3>
                    <p className="text-gray-600">{t.home?.faq?.a5 || '登入後在歷史記錄中可以找到並刪除您創建的短網址。'}</p>
                  </div>
                </div>
              </div>
              
              {/* 好處區塊 */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-4 text-center">{t.home?.benefits?.title || '為什麼選擇我們的短網址服務？'}</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t.home?.benefits?.point1 || '完全免費使用，沒有隱藏收費'}</li>
                  <li>{t.home?.benefits?.point2 || '不限制點擊次數或到期時間'}</li>
                  <li>{t.home?.benefits?.point3 || '提供點擊統計和分析'}</li>
                  <li>{t.home?.benefits?.point4 || '自訂短碼選項（登入用戶）'}</li>
                  <li>{t.home?.benefits?.point5 || '清晰的歷史記錄'}</li>
                  <li>{t.home?.benefits?.point6 || '簡單直覺的用戶界面'}</li>
                  <li>{t.home?.benefits?.point7 || '支持多語言（中文和英文）'}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}