import { getServerSideSitemap } from 'next-sitemap';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // 從資料庫獲取熱門短網址（如果可能），但排除包含隱私資訊的URL
  // 注意：這是一個範例，您需要根據您的資料庫結構進行調整
  const { data: urls, error } = await supabase
    .from('urls')
    .select('short_code, created_at')
    .order('click_count', { ascending: false })
    .limit(100) // 只獲取最熱門的100個短網址，您可以根據需要調整
    .is('is_private', false) // 只包含公共URLs，如果您有此欄位
    .gt('click_count', 10); // 只包含有一定點擊量的URLs，避免列出無用短網址
  
  if (error) {
    console.error('獲取網址資料失敗:', error);
    return getServerSideSitemap([]);
  }
  
  // 將網址轉換為 sitemap 格式
  const fields = urls.map(url => ({
    loc: `https://vvrl.cc/${url.short_code}`,
    lastmod: new Date(url.created_at).toISOString(),
    changefreq: 'weekly',
    priority: 0.5,
  }));
  
  // 添加靜態頁面（如果需要）
  const staticPages = [
    // 英文主要頁面 - 高優先級
    {
      loc: 'https://vvrl.cc/',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
    },
    {
      loc: 'https://vvrl.cc/custom',
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      loc: 'https://vvrl.cc/history',
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.8,
    },
    {
      loc: 'https://vvrl.cc/privacy-policy',
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: 0.5,
    },
    {
      loc: 'https://vvrl.cc/terms',
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: 0.5,
    },
    
    // 中文頁面 - 較低優先級
    {
      loc: 'https://vvrl.cc/tw',
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.7, // 低於英文版
    },
    {
      loc: 'https://vvrl.cc/tw/custom',
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.6, // 低於英文版
    },
    {
      loc: 'https://vvrl.cc/tw/history',
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.6, // 低於英文版
    },
    {
      loc: 'https://vvrl.cc/tw/privacy-policy',
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: 0.3, // 低於英文版
    },
    {
      loc: 'https://vvrl.cc/tw/terms',
      lastmod: new Date().toISOString(),
      changefreq: 'yearly',
      priority: 0.3, // 低於英文版
    },
  ];
  
  // 合併並返回 sitemap
  return getServerSideSitemap([...fields, ...staticPages]);
}