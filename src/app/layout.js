import '@/styles/globals.css'; // 使用自訂 alias 導入全局樣式

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

export const metadata = {
  title: '網址縮短器',
  description: '簡單的網址縮短工具',
};