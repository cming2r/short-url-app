import { NextResponse } from 'next/server';
import axios from 'axios';
import { load } from 'cheerio';

// 處理標題獲取的API端點
export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ 
        error: 'URL is required' 
      }, { status: 400 });
    }

    // 驗證URL格式
    let formattedUrl = url.trim();
    if (!/^https?:\/\//.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl);
    } catch (urlError) {
      return NextResponse.json({ 
        error: 'Invalid URL format',
        title: url 
      }, { status: 400 });
    }

    try {
      // 使用 axios 獲取HTML
      const response = await axios.get(formattedUrl, { 
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        }
      });
      
      const html = response.data;

      // 使用 cheerio 解析HTML
      const $ = load(html);
      let title = $('title').text().trim();

      // 處理空標題
      if (!title || title === '') {
        return NextResponse.json({ title: url });
      }

      // 處理標題
      title = title.replace(/^\s*|\s*$/g, '').replace(/\s+/g, ' ');
      title = title.length > 50 ? title.substring(0, 50) + '...' : title;

      return NextResponse.json({ title });
    } catch (error) {
      console.error('Failed to fetch URL:', error.message);
      return NextResponse.json({ 
        error: 'Failed to fetch title',
        title: url 
      });
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      title: 'Error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    error: 'Method not allowed' 
  }, { status: 405 });
}