import './globals.css';
import { SupabaseProvider } from '@/components/SupabaseProvider';
import { LanguageProvider } from '@/lib/i18n';
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: 'URL Shortener',
  description: 'Simple, fast, and reliable URL shortening tool',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'URL Shortener',
  },
  // 確保 icon 請求能被正確處理
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
    other: {
      rel: 'apple-touch-icon-precomposed',
      url: '/favicon.ico',
    },
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body className="flex flex-col min-h-screen bg-white">
        <SupabaseProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </SupabaseProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}