import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 定期清理超過一個月未訪問的短網址
 * 可通過 Vercel Cron Jobs 配置為定期執行
 */
export async function GET(request) {
  console.log('開始清理過期短網址');
  
  try {
    // 計算一個月前的日期
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const oneMonthAgoISOString = oneMonthAgo.toISOString();
    
    console.log(`查找最後點擊時間早於 ${oneMonthAgoISOString} 的網址`);
    
    // 1. 清理普通短網址
    const { data: expiredUrls, error: urlsError } = await supabaseAdmin
      .from('urls')
      .select('id, short_code, original_url, last_clicked_at')
      .lt('last_clicked_at', oneMonthAgoISOString);
    
    if (urlsError) {
      console.error('查詢過期普通短網址時出錯:', urlsError);
    } else {
      console.log(`找到 ${expiredUrls.length} 個超過一個月未點擊的普通短網址`);
      
      if (expiredUrls.length > 0) {
        // 列出要刪除的短網址
        expiredUrls.forEach(url => {
          console.log(`- 即將刪除普通短網址: ${url.short_code} => ${url.original_url} (最後點擊: ${url.last_clicked_at})`);
        });
        
        // 刪除這些短網址
        const shortCodesToDelete = expiredUrls.map(url => url.short_code);
        
        const { error: deleteError } = await supabaseAdmin
          .from('urls')
          .delete()
          .in('short_code', shortCodesToDelete);
        
        if (deleteError) {
          console.error('刪除過期普通短網址時出錯:', deleteError);
        } else {
          console.log(`成功刪除 ${shortCodesToDelete.length} 個過期普通短網址`);
        }
      }
    }
    
    // 2. 清理自定義短網址
    const { data: expiredCustomUrls, error: customUrlsError } = await supabaseAdmin
      .from('custom_urls')
      .select('id, short_code, original_url, last_clicked_at')
      .lt('last_clicked_at', oneMonthAgoISOString);
    
    if (customUrlsError) {
      console.error('查詢過期自定義短網址時出錯:', customUrlsError);
    } else {
      console.log(`找到 ${expiredCustomUrls.length} 個超過一個月未點擊的自定義短網址`);
      
      if (expiredCustomUrls.length > 0) {
        // 列出要刪除的自定義短網址
        expiredCustomUrls.forEach(url => {
          console.log(`- 即將刪除自定義短網址: ${url.short_code} => ${url.original_url} (最後點擊: ${url.last_clicked_at})`);
        });
        
        // 刪除這些自定義短網址
        const shortCodesToDelete = expiredCustomUrls.map(url => url.short_code);
        
        const { error: deleteError } = await supabaseAdmin
          .from('custom_urls')
          .delete()
          .in('short_code', shortCodesToDelete);
        
        if (deleteError) {
          console.error('刪除過期自定義短網址時出錯:', deleteError);
        } else {
          console.log(`成功刪除 ${shortCodesToDelete.length} 個過期自定義短網址`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      deletedUrls: (expiredUrls || []).length,
      deletedCustomUrls: (expiredCustomUrls || []).length,
      message: '過期短網址清理完成',
    });
  } catch (error) {
    console.error('清理過期短網址時出錯:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}