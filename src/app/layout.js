import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SupabaseProvider } from '@/components/SupabaseProvider';

export const metadata = {
  title: '網址縮短器',
  description: '簡單的網址縮短工具',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <SupabaseProvider>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </SupabaseProvider>
      </body>
    </html>
  );
}