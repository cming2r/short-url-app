// src/app/layout.js
import '@/app/globals.css';

export const metadata = {
  title: '網址縮短器',
  description: '簡單的網址縮短工具',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}