/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // 移除所有自動語言重定向
    ];
  },
  async rewrites() {
    return [
      // 處理短網址 - 將符合6-8字符的短碼重寫到_shortcuts處理器
      {
        source: '/:shortCode([a-zA-Z0-9]{6,8})',
        destination: '/_shortcuts/:shortCode',
      }
    ];
  },
};

export default nextConfig;
