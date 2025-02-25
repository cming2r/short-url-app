// src/app/_not-found/page.js
'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center bg-gray-100 py-8 min-h-screen">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">404 - 頁面未找到</h1>
        <p className="mb-4">抱歉，您訪問的頁面不存在。</p>
        <Link href="/" className="text-blue-500 underline hover:text-blue-700">
          返回首頁
        </Link>
      </div>
    </div>
  );
}