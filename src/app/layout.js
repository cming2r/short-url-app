// src/app/layout.js
import '@/styles/globals.css';

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