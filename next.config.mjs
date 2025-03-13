/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // 如需新增重定向規則，可在此添加
    ];
  },
  async rewrites() {
    return [
      // 處理語言路徑 - 將 /tw 路徑重寫到 /[locale] 動態路由
      {
        source: '/tw',
        destination: '/tw',
      },
      {
        source: '/tw/:path*',
        destination: '/tw/:path*',
      },
      // 處理短網址 - 將符合6-8字符的短碼重寫到_shortcuts處理器
      {
        source: '/:shortCode([a-zA-Z0-9]{6,8})',
        destination: '/_shortcuts/:shortCode',
      },
      // 處理任何可能是短碼的路徑 (middleware 中的備用邏輯)
      {
        source: '/:shortCode([^/]+)',
        destination: '/_shortcuts/:shortCode',
        has: [
          {
            type: 'header',
            key: 'host',
            value: '(?!api|_next|_shortcuts|icons).*'
          }
        ],
        missing: [
          {
            type: 'query',
            key: 'en'
          },
          {
            type: 'query',
            key: 'tw'
          }
        ]
      },
      // 處理 OAuth 回調
      {
        source: '/:path*',
        destination: '/:path*',
        has: [
          {
            type: 'query',
            key: 'code',
          },
        ],
      },
      {
        source: '/:path*',
        destination: '/:path*',
        has: [
          {
            type: 'query',
            key: 'error',
          },
        ],
      },
    ];
  }
};

export default nextConfig;
