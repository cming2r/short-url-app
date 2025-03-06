import axios from 'axios';
import { load } from 'cheerio';

/**
 * 從 URL 獲取網頁標題
 * @param {string} url - 要獲取標題的 URL
 * @returns {Promise<string>} - 網頁標題，如果無法獲取則返回原始 URL
 */
export async function fetchTitle(url) {
  try {
    // 驗證並格式化 URL
    let formattedUrl = url.trim();
    if (!/^https?:\/\//.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      new URL(formattedUrl); // 驗證 URL 格式
    } catch (urlError) {
      console.error('Invalid URL format:', formattedUrl);
      return url; // 回傳原始 URL 作為預設標題
    }

    // 使用 axios 獲取完整的 HTML
    const response = await axios.get(formattedUrl, { 
      timeout: 5000, // 設置超時，避免延遲過長
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      }
    });
    const html = response.data;

    // 使用 cheerio 解析 HTML
    const $ = load(html);
    let title = $('title').text().trim();

    // 處理空標題或無效標題
    if (!title || title === '') {
      return url; // 回傳原始 URL 作為預設標題
    }

    // 移除多餘的空白字符
    title = title.replace(/^\s*|\s*$/g, '').replace(/\s+/g, ' ');

    // 限制標題長度，避免過長
    return title.length > 50 ? title.substring(0, 50) + '...' : title;
  } catch (error) {
    console.error('Failed to fetch title:', error.message);
    return url; // 回傳原始 URL 作為預設標題
  }
}