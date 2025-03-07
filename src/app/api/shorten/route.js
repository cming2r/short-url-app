import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { fetchTitle } from '@/lib/utils/fetchTitle';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required in environment variables');
}

export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  cookies,
});

export async function POST(request) {
  console.log('POST /api/shorten called');
  console.log('BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);

  const requestBody = await request.json();
  const { url, customCode, userId, accessToken } = requestBody;
  
  console.log('Request body received:', { 
    hasUrl: !!url, 
    hasCustomCode: !!customCode, 
    hasUserId: !!userId, 
    hasAccessToken: !!accessToken,
    rawUserId: userId
  });

  if (!url) {
    return new Response(JSON.stringify({ error: 'Invalid URL, URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 驗證並格式化 URL
  let formattedUrl = url.trim();
  if (!/^https?:\/\//.test(formattedUrl)) {
    // 如果缺少協議，假設為 https
    formattedUrl = `https://${formattedUrl}`;
  }

  try {
    new URL(formattedUrl); // 驗證 URL 格式
  } catch (urlError) {
    return new Response(JSON.stringify({ error: 'Invalid URL format, must start with http:// or https://' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let shortCode = customCode || nanoid(6);
  if (customCode) {
    // 更新為與前端一致的驗證規則：4-5個字符，至少一個字母和一個數字
    const isValidLength = customCode.length >= 4 && customCode.length <= 5;
    const hasLetter = /[a-zA-Z]/.test(customCode);
    const hasNumber = /[0-9]/.test(customCode);
    const isValidChars = /^[a-zA-Z0-9]+$/.test(customCode);
    
    if (!isValidLength || !hasLetter || !hasNumber || !isValidChars) {
      return new Response(JSON.stringify({ error: '自訂短碼必須為4-5位元，且至少包含一個字母及一個數字' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    let currentUserId = userId || null;
    
    // 如果提供了 userId 和 accessToken，驗證用戶身份
    if (userId && accessToken) {
      try {
        // 使用 access_token 驗證會話
        const { data: { user }, error: tokenError } = await supabaseServer.auth.getUser(accessToken);
        
        console.log('User verification result:', { 
          userProvided: !!user,
          userId: userId,
          retrievedUserId: user?.id,
          hasTokenError: !!tokenError
        });
        
        if (tokenError) {
          console.warn('Token verification error:', tokenError.message);
          currentUserId = null; // 重置用戶ID為 null
        } else if (!user) {
          console.warn('No user found with provided token');
          currentUserId = null;
        } else if (user.id !== userId) {
          console.warn('User ID mismatch:', { providedId: userId, tokenUserId: user.id });
          currentUserId = user.id; // 使用驗證後的用戶 ID，而不是傳入的ID
        } else {
          console.log('User verified successfully:', user.id);
          currentUserId = user.id; // 使用驗證後的用戶 ID
        }
      } catch (authError) {
        console.error('Error during authentication:', authError);
        // 出錯時仍然使用提供的用戶 ID
        console.log('Falling back to provided user ID due to auth error');
        currentUserId = userId;
      }
    } else if (userId) {
      // 如果只有userId但沒有accessToken，仍然使用userId
      console.log('Using provided userId without token verification');
      currentUserId = userId;
    }

    if (customCode) {
      // 自定義短網址要求已登入用戶
      if (!currentUserId) {
        return new Response(JSON.stringify({ error: 'User not authenticated for custom URL' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 檢查是否已有自定義短網址
      const { data: existingCustom, error: customError } = await supabaseServer
        .from('custom_urls')
        .select('short_code')
        .eq('user_id', currentUserId)
        .single();

      if (customError && customError.code !== 'PGRST116') { // PGRST116 表示無記錄
        throw customError;
      }
      if (existingCustom) {
        return new Response(JSON.stringify({ error: '已存在自訂短網址，無法再創建新的自訂短網址' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // 檢查自定義短碼是否已被使用
      const { data, error } = await supabaseServer
        .from('custom_urls')
        .select('short_code')
        .eq('short_code', customCode)
        .single();
      if (error && error.code !== 'PGRST116') { // PGRST116 表示無記錄
        throw error;
      }
      if (data) {
        return new Response(JSON.stringify({ error: '自訂短碼已被使用' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Current user ID for URL:', currentUserId);
    console.log('User ID status check:', {
      originalUserId: userId,
      finalUserId: currentUserId,
      willAssociateWithUser: !!currentUserId
    });

    // 獲取 original_url 的標題
    const title = await fetchTitle(formattedUrl);

    if (customCode) {
      // 插入自定義短網址到 custom_urls 表
      const { error } = await supabaseServer.from('custom_urls').insert({
        user_id: currentUserId,
        short_code: shortCode,
        original_url: formattedUrl,
        title,
        created_at: new Date().toISOString(),
        click_count: 0,
        last_clicked_at: new Date().toISOString(), // 初始設置為創建時間
      });

      if (error) throw error;
    } else {
      // 插入普通縮網址到 urls 表，確保記錄 user_id
      // 創建URL插入數據
      const urlData = {
        short_code: shortCode,
        original_url: formattedUrl,
        user_id: currentUserId,
        title,
        created_at: new Date().toISOString(),
        click_count: 0,
        last_clicked_at: new Date().toISOString(), // 初始設置為創建時間
      };
      
      console.log('Inserting URL data with user_id:', currentUserId);
      console.log('Full insert data:', urlData);
      
      const { data: insertedData, error } = await supabaseServer
        .from('urls')
        .insert(urlData)
        .select();

      if (error) {
        console.error('Error inserting URL:', error);
        throw error;
      }
      
      console.log('Insert result:', insertedData);
    }

    console.log('Inserted into database successfully');
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${shortCode}`;
    console.log('Generated shortUrl:', shortUrl);

    return new Response(JSON.stringify({ shortUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('API error:', { message: error.message, code: error.code });
    return new Response(JSON.stringify({ error: `Internal server error: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: { 'Allow': 'POST' },
  });
}