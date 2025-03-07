import './globals.css';
import { SupabaseProvider } from '@/components/SupabaseProvider';
import { LanguageProvider } from '@/lib/i18n';
import { SpeedInsights } from "@vercel/speed-insights/next"

// 基本元數據 - 具體元數據將由子布局提供
export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://vvrl.cc'),
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "vvrl.cc URL Shortener",
              "url": "https://vvrl.cc",
              "description": "Free URL shortener service with tracking and custom URLs",
              "applicationCategory": "Utility",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className="flex flex-col min-h-screen bg-white" suppressHydrationWarning={true}>
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