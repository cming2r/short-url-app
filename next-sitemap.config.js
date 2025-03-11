/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://vvrl.cc',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://vvrl.cc/server-sitemap.xml', // 動態生成的 sitemap
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
  exclude: [
    '/_shortcuts/*',
    '/api/*',
    // 保留中文版在 sitemap 中，但會通過 hreflang 標記設置優先級
  ],
  // 定制不同路徑的優先級和更新頻率
  transform: (config, path) => {
    // 預設優先級
    let priority = 0.7;
    let changefreq = 'weekly';
    
    // 根據路徑設定不同的優先級和更新頻率
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/tw') {
      priority = 0.9;
      changefreq = 'daily';
    } else if (path.includes('/custom') || path.includes('/history')) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.includes('/privacy-policy') || path.includes('/terms')) {
      priority = 0.5;
      changefreq = 'yearly';
    }

    // 添加多語言替代URL
    const alternateRefs = [];
    
    // 英文版頁面
    if (!path.startsWith('/tw')) {
      const cleanPath = path === '/' ? '' : path;
      alternateRefs.push({
        href: `${config.siteUrl}${cleanPath}`,
        hreflang: 'en'
      });
      
      // 對應的中文版頁面
      const twPath = path === '/' ? '/tw' : `/tw${path}`;
      alternateRefs.push({
        href: `${config.siteUrl}${twPath}`,
        hreflang: 'zh-TW'
      });
    } 
    // 中文版頁面
    else {
      alternateRefs.push({
        href: `${config.siteUrl}${path}`,
        hreflang: 'zh-TW'
      });
      
      // 對應的英文版頁面
      const enPath = path.replace('/tw', '') || '/';
      alternateRefs.push({
        href: `${config.siteUrl}${enPath}`,
        hreflang: 'en'
      });
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      alternateRefs,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
  
  // 靜態路徑配置
  sitemapSize: 7000,
  generateIndexSitemap: false,
  autoLastmod: true,
};