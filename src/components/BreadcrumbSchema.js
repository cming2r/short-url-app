'use client';

import { usePathname } from 'next/navigation';

// BreadcrumbList 結構化資料組件
export default function BreadcrumbSchema() {
  const pathname = usePathname();
  const baseUrl = 'https://vvrl.cc';
  
  // 解析路徑並生成麵包屑項目
  const generateBreadcrumbItems = () => {
    // 始終從主頁開始
    const items = [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      }
    ];
    
    // 如果是首頁，直接返回
    if (pathname === '/' || pathname === '/tw') {
      return items;
    }
    
    // 處理中文版路徑
    const isChinese = pathname.startsWith('/tw');
    let segments = pathname.split('/').filter(Boolean);
    
    // 如果是中文版，添加台灣作為第二級
    if (isChinese) {
      items.push({
        "@type": "ListItem",
        "position": 2,
        "name": "台灣",
        "item": `${baseUrl}/tw`
      });
      // 移除tw段，以便處理剩餘路徑
      segments = segments.slice(1);
    }
    
    // 處理剩餘路徑段
    segments.forEach((segment, index) => {
      const position = isChinese ? index + 3 : index + 2;
      const path = isChinese 
        ? `${baseUrl}/tw/${segments.slice(0, index + 1).join('/')}` 
        : `${baseUrl}/${segments.slice(0, index + 1).join('/')}`;
        
      // 將路徑段轉換為易讀名稱
      let name;
      switch(segment) {
        case 'custom':
          name = isChinese ? '自訂短網址' : 'Custom URL';
          break;
        case 'history':
          name = isChinese ? '歷史記錄' : 'URL History';
          break;
        case 'privacy-policy':
          name = isChinese ? '隱私政策' : 'Privacy Policy';
          break;
        case 'terms':
          name = isChinese ? '使用條款' : 'Terms of Service';
          break;
        default:
          name = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      items.push({
        "@type": "ListItem",
        "position": position,
        "name": name,
        "item": path
      });
    });
    
    return items;
  };
  
  const breadcrumbItems = generateBreadcrumbItems();
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema)
      }}
    />
  );
}