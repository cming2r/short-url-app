// src/app/not-found.js
export default function NotFound() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold">短網址無效</h1>
          <p className="mt-2">短網址無效或處理中，請稍後再試。</p>
        </div>
      </div>
    );
  }
  