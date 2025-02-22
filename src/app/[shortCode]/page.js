// src/app/[shortCode]/page.js
export default function RedirectFallback({ params }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500">短網址無效或處理中，請稍後再試</p>
    </div>
  );
}