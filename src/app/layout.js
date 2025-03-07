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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Is this service free?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, our URL shortening service is completely free to use with no hidden fees."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How long do short URLs last?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Short URLs do not have a fixed expiration date. They remain active as long as they are regularly visited."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I create custom short codes?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, logged-in users can create custom short codes that follow our rule of 4-5 characters with at least one letter and one number."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I track how many times my short URL has been clicked?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, logged-in users can view the click count and last clicked time for each short URL in their history."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I delete short URLs I've created?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "After logging in, you can find and delete your short URLs from the history page."
                  }
                }
              ]
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