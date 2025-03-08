/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://vvrl.cc',
  generateRobotsTxt: true,
  robotsTxtOptions: {
    additionalSitemaps: [
      'https://vvrl.cc/server-sitemap.xml', // 如果您想添加動態生成的 sitemap
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/_shortcuts',
          '/api/*',
          '/_next/*',
        ],
      },
    ],
  },
  exclude: [
    '/_shortcuts/*',
    '/api/*',
    // 保留中文版在 sitemap 中，但會通過 hreflang 標記設置優先級
  ],
  // 靜態路徑配置
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  generateIndexSitemap: true,
};