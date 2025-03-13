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
      // 處理短網址 - 將符合短碼格式的路徑重寫到_shortcuts處理器
      {
        source: '/:shortCode((?!custom|history|privacy-policy|terms|en|tw|api|_next|_shortcuts|favicon|manifest).+)',
        destination: '/_shortcuts/:shortCode',
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
