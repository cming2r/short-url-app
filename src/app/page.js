'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log('Client session in page.js:', session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      console.log('Auth state changed in page.js:', { event, session });
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleShorten = async () => {
    setError('');
    setShortUrl('');
    if (!longUrl || !/^https?:\/\//.test(longUrl)) {
      setError('請輸入有效的 URL（需包含 http:// 或 https://）');
      return;
    }

    try {
      const userId = session?.user?.id || null;
      const accessToken = session?.access_token || null;
      console.log('User ID sent from page.js:', userId);
      console.log('Access token sent from page.js:', accessToken);

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: longUrl, userId, accessToken }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('API raw response:', text);
        throw new Error(`API request failed with status ${response.status}: ${text}`);
      }

      const data = await response.json();
      if (data.shortUrl) {
        setShortUrl(data.shortUrl);
        setLongUrl(''); // 清空輸入
      } else {
        setError('縮短網址失敗：未收到短網址');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`縮短網址失敗：${err.message}`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    alert('短網址已複製到剪貼簿！');
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* 主要縮短工具 */}
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md slide-in mb-8">
        <h1 className="text-3xl font-bold text-center mb-4 fade-in bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">網址縮短器</h1>
        <p className="text-center text-gray-600 mb-6 fade-in" style={{animationDelay: '0.2s'}}>
          簡單、快速地縮短您的網址，讓分享更方便
        </p>
        <input
          type="text"
          value={longUrl}
          onChange={(e) => setLongUrl(e.target.value)}
          placeholder="輸入長網址 (例如: https://example.com/long-url...)"
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <button
          onClick={handleShorten}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 active:scale-95 font-medium"
        >
          縮短網址
        </button>
        {shortUrl && (
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 bounce-in">
            <p className="text-center font-medium text-gray-700 mb-2">
              您的短網址已準備好:
            </p>
            <div className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 truncate transition-colors duration-200"
              >
                {shortUrl}
              </a>
              <button
                onClick={handleCopy}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-all duration-200 active:scale-95 ml-2 flex-shrink-0"
              >
                複製
              </button>
            </div>
          </div>
        )}
        {error && <p className="mt-4 text-center text-red-500 shake p-3 bg-red-50 rounded-lg">{error}</p>}
      </div>
      
      {/* 產品特性 */}
      <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md slide-in" style={{animationDelay: '0.1s'}}>
          <div className="text-blue-500 mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center mb-2">快速縮短</h2>
          <p className="text-gray-600 text-center">即時生成短網址，無需等待。使用優化算法生成簡短的URL。</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md slide-in" style={{animationDelay: '0.2s'}}>
          <div className="text-blue-500 mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center mb-2">安全可靠</h2>
          <p className="text-gray-600 text-center">所有鏈接都經過驗證，確保安全。網址永不過期，除非閒置太久。</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md slide-in" style={{animationDelay: '0.3s'}}>
          <div className="text-blue-500 mb-4 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-center mb-2">自定義短網址</h2>
          <p className="text-gray-600 text-center">登入後享有更多功能，包括自定義短網址、使用統計及歷史記錄。</p>
        </div>
      </div>
      
      {/* 使用說明 */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg slide-in" style={{animationDelay: '0.4s'}}>
        <h2 className="text-2xl font-bold text-center mb-4">如何使用</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">1</div>
            <div className="ml-4">
              <h3 className="text-lg font-medium">輸入長網址</h3>
              <p className="text-gray-600">在上方輸入框中粘貼您想要縮短的網址。確保包含 http:// 或 https://</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">2</div>
            <div className="ml-4">
              <h3 className="text-lg font-medium">點擊縮短按鈕</h3>
              <p className="text-gray-600">系統將立即為您生成一個簡短的網址</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">3</div>
            <div className="ml-4">
              <h3 className="text-lg font-medium">複製並分享</h3>
              <p className="text-gray-600">點擊複製按鈕，然後將短網址分享到社交媒體、電子郵件或短信</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mt-1">4</div>
            <div className="ml-4">
              <h3 className="text-lg font-medium">登入獲取更多功能</h3>
              <p className="text-gray-600">登入後可以管理您的短網址，查看點擊統計和創建自定義短網址</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}