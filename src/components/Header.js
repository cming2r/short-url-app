// src/components/Header.js
export default function Header() {
    return (
      <header className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">
            <a href="/" className="hover:underline">網址縮短器</a>
          </h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <a href="/" className="hover:underline">首頁</a>
              </li>
              {/* 未來可添加更多導航，例如 <li><a href="/about">關於</a></li> */}
            </ul>
          </nav>
        </div>
      </header>
    );
  }