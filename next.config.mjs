/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // English browser language
      {
        source: '/custom',
        destination: '/en/custom',
        permanent: false,
        has: [
          {
            type: 'header',
            key: 'accept-language',
            value: '(^|,)\\s*en([^a-zA-Z]|$)',
          },
        ],
      },
      {
        source: '/history',
        destination: '/en/history',
        permanent: false,
        has: [
          {
            type: 'header',
            key: 'accept-language',
            value: '(^|,)\\s*en([^a-zA-Z]|$)',
          },
        ],
      },
      {
        source: '/privacy-policy',
        destination: '/en/privacy-policy',
        permanent: false,
        has: [
          {
            type: 'header',
            key: 'accept-language',
            value: '(^|,)\\s*en([^a-zA-Z]|$)',
          },
        ],
      },
      {
        source: '/terms',
        destination: '/en/terms',
        permanent: false,
        has: [
          {
            type: 'header',
            key: 'accept-language',
            value: '(^|,)\\s*en([^a-zA-Z]|$)',
          },
        ],
      },
      
      // Default to Traditional Chinese (tw)
      {
        source: '/custom',
        destination: '/tw/custom',
        permanent: false,
      },
      {
        source: '/history',
        destination: '/tw/history',
        permanent: false,
      },
      {
        source: '/privacy-policy',
        destination: '/tw/privacy-policy',
        permanent: false,
      },
      {
        source: '/terms',
        destination: '/tw/terms',
        permanent: false,
      },
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
