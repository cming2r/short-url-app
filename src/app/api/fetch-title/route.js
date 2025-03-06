import { NextResponse } from 'next/server';
import { fetchTitle } from '@/lib/utils/fetchTitle';

// 處理標題獲取的API端點
export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ 
        error: 'URL is required' 
      }, { status: 400 });
    }

    try {
      // 使用共享的 fetchTitle 工具函數
      const title = await fetchTitle(url);
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