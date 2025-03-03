import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SupabaseProvider } from '@/components/SupabaseProvider';
import { LanguageProvider } from '@/lib/i18n';
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata = {
  title: '網址縮短器',
  description: '簡單、快速、可靠的網址縮短工具',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '網址縮短器',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body className="flex flex-col min-h-screen bg-white">
        <SupabaseProvider>
          <LanguageProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </LanguageProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}