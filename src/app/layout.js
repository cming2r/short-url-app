import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className="bg-gray-100">
        <nav className="bg-gray-900 text-white p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <a href="/" className="text-lg font-bold">縮短網址服務</a>
            <div>
              <a href="/history" className="text-white mx-2">歷史記錄</a>
              <a href="/custom" className="text-white mx-2">自訂短網址</a>
              <a href="/logout" className="text-white mx-2">登出</a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}