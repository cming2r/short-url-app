/**
 * 生成頁面元數據的通用函數
 * 使用現代 Next.js Metadata API
 * @param {Object} options - 元數據選項
 * @param {string} options.title - 頁面標題
 * @param {string} options.description - 頁面描述
 * @param {string} options.path - 頁面路徑 (例如 '/custom', '/history')
 * @param {string} options.ogImagePath - Open Graph 圖片路徑 (例如 '/og-image.png', '/og-custom.png')
 * @param {string} options.type - 頁面類型 (預設為 'website')
 * @returns {Object} - Next.js 元數據對象
 */
export function generateMetadata({
  title,
  description,
  path = '/',
  ogImagePath = '/og-image.png',
  type = 'website'
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vvrl.cc';
  const url = `${baseUrl}${path}`;
  
  // 清理標題 - 如果標題已經包含品牌名稱，則不重複
  const displayTitle = title.includes('vvrl.cc')
    ? title
    : `${title} | vvrl.cc URL Shortener`;
  
  // 清理 Twitter 標題 - 保持簡短
  const twitterTitle = title.includes('vvrl.cc')
    ? title
    : title;
  
  return {
    title: displayTitle,
    description,
    
    // 規範連結
    alternates: {
      canonical: url,
    },
    
    // Open Graph 標籤
    openGraph: {
      type,
      siteName: 'vvrl.cc',
      title,
      description,
      url,
      images: [
        {
          url: `${baseUrl}${ogImagePath}`,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
    
    // Twitter 卡片
    twitter: {
      card: 'summary_large_image',
      title: twitterTitle,
      description,
      images: [`${baseUrl}${ogImagePath}`],
      creator: '@vvrlcc',
    },
  };
}