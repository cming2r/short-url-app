'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestRedirect() {
  const [shortCode, setShortCode] = useState('');
  const router = useRouter();

  const handleTest = (e) => {
    e.preventDefault();
    if (shortCode) {
      window.location.href = `/${shortCode}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">Test Short URL Redirect</h1>
      
      <form onSubmit={handleTest} className="w-full max-w-md flex flex-col gap-4">
        <div>
          <label htmlFor="shortCode" className="block mb-2 font-medium">
            Short Code to Test:
          </label>
          <input
            id="shortCode"
            type="text"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value)}
            placeholder="Enter short code (e.g. abc123)"
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>
        
        <button 
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
        >
          Test Redirect
        </button>
      </form>
      
      <div className="mt-8 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">How to test:</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Enter a valid short code that exists in your database</li>
          <li>Click "Test Redirect" to simulate accessing that short URL</li>
          <li>You should be redirected to the original URL</li>
          <li>If not, check console logs for errors</li>
        </ol>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded w-full max-w-md">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This is a test page for local development. 
          Make sure your .env.local file has the correct Supabase credentials and BASE_URL is set correctly.
        </p>
      </div>
    </div>
  );
}