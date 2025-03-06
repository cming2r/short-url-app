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
  
  // 處理 OAuth 回調代碼
  useEffect(() => {
    if (code) {
      console.log('Detected OAuth callback code:', code);
      
      // 檢查 URL 中是否有 OAuth 回調代碼，並處理登入
      const handleOAuthCallback = async () => {
        try {
          // 這是從 Google OAuth 返回的回調
          console.log('Processing OAuth callback with code:', code);
          
          // 嘗試直接從 URL 提取會話 (Supabase 應該會自動處理這個)
          const { data, error } = await supabase.auth.getSession();
          console.log('Current session after OAuth redirect:', Boolean(data.session));
          
          if (error) {
            console.error('Error getting session:', error);
          }
          
          if (!data.session) {
            console.log('No session found after OAuth callback, trying to exchange code');
            
            // 記錄認證流程正在進行中
            localStorage.setItem('authInProgress', 'true');
            
            // 使用 code 作為觸發器讓 Supabase 處理內部會話設置
            // 創建頁面重載計時器以等待 Supabase 完成 OAuth 處理
            setTimeout(() => {
              console.log('Reloading page to finalize authentication');
              window.location.reload();
            }, 1000);
          } else {
            console.log('Session found, authentication successful');
            setSession(data.session);
          }
        } catch (error) {
          console.error('Error processing OAuth callback:', error);
        }
      };
      
      handleOAuthCallback();
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
      const accessToken = session?.access_token || null;
      
      console.log('Shortening URL with user info:', { 
        isLoggedIn: !!session, 
        hasUserId: !!userId 
      });
      
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url,
          userId,  // 添加用戶 ID
          accessToken  // 添加訪問 token
        }),
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
                <div className="mb-3">
                  <a 
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline text-lg break-all"
                  >
                    {shortUrl}
                  </a>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="flex-grow p-2 border border-gray-300 rounded bg-white"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    {copied ? t.home?.copied || 'Copied!' : t.home?.copyButton || 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}