import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DEFAULT_LOCALE } from '@/lib/i18n/constants';

// 使用普通組件，不需要客戶端的 useTranslation
const PrivacyContent = ({ locale }) => {
  // 中文內容
  const zhContent = (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">隱私政策</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. 資料收集</h2>
          <p>我們的短網址服務會收集以下資訊：</p>
          <ul className="list-disc ml-6 mt-2">
            <li>您創建的短網址和目標網址</li>
            <li>點擊統計和流量來源</li>
            <li>登入用戶的帳號資訊</li>
            <li>使用服務時的 IP 地址和瀏覽器資訊</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. 資料使用</h2>
          <p>我們使用收集的資訊用於：</p>
          <ul className="list-disc ml-6 mt-2">
            <li>提供和維護短網址服務</li>
            <li>改進我們的服務和用戶體驗</li>
            <li>提供短網址的分析和使用統計</li>
            <li>偵測和防止濫用行為</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Cookie 使用</h2>
          <p>我們使用 Cookie 和類似技術來：</p>
          <ul className="list-disc ml-6 mt-2">
            <li>記住您的登入狀態</li>
            <li>收集有關網站使用情況的統計資料</li>
            <li>提升網站性能和用戶體驗</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. 資料分享</h2>
          <p>我們不會與第三方分享您的個人資訊，除非：</p>
          <ul className="list-disc ml-6 mt-2">
            <li>獲得您的明確許可</li>
            <li>需要遵守法律要求</li>
            <li>保護我們或他人的權利、財產或安全</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. 資料安全</h2>
          <p>我們採取合理的安全措施保護您的資訊，但請注意，沒有任何網路傳輸或電子存儲方法是 100% 安全的。</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. 第三方連結</h2>
          <p>我們的服務可能包含指向第三方網站的連結。我們對這些網站的隱私政策或內容不負責任。</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. 未成年人</h2>
          <p>我們的服務不針對 13 歲以下的兒童。如果您發現您的孩子未經您同意向我們提供了個人資訊，請聯繫我們。</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. 政策變更</h2>
          <p>我們可能會不時更新本隱私政策。我們會通過在網站上發布新版本來通知您任何變更。</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. 聯繫我們</h2>
          <p>如果您對我們的隱私政策有任何疑問，請通過網站的聯繫方式與我們聯繫。</p>
        </section>
      </div>
      
      <div className="mt-8 text-sm text-gray-600">
        <p>最後更新：2025 年 3 月 7 日</p>
      </div>
    </div>
  );

  // 英文內容
  const enContent = (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information Collection</h2>
          <p>Our URL shortening service collects the following information:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Short URLs you create and their target destinations</li>
            <li>Click statistics and traffic sources</li>
            <li>Account information for logged-in users</li>
            <li>IP addresses and browser information when using our service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Information Usage</h2>
          <p>We use the collected information to:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Provide and maintain our URL shortening service</li>
            <li>Improve our services and user experience</li>
            <li>Provide analytics and usage statistics for your shortened URLs</li>
            <li>Detect and prevent abuse</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Use of Cookies</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Remember your login status</li>
            <li>Collect statistics about website usage</li>
            <li>Enhance website performance and user experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Information Sharing</h2>
          <p>We do not share your personal information with third parties except:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>With your explicit permission</li>
            <li>To comply with legal requirements</li>
            <li>To protect our or others' rights, property, or safety</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
          <p>We implement reasonable security measures to protect your information, but please note that no method of transmission over the internet or electronic storage is 100% secure.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Third-Party Links</h2>
          <p>Our service may contain links to third-party websites. We are not responsible for the privacy policies or content of these websites.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Children's Privacy</h2>
          <p>Our service is not directed to children under 13. If you learn that your child has provided us with personal information without your consent, please contact us.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Changes to This Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
          <p>If you have any questions about our Privacy Policy, please contact us through the contact information provided on our website.</p>
        </section>
      </div>
      
      <div className="mt-8 text-sm text-gray-600">
        <p>Last updated: March 7, 2025</p>
      </div>
    </div>
  );

  return locale === 'zh-TW' ? zhContent : enContent;
};

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'tw' }];
}

export default async function PrivacyPage({ params }) {
  const resolvedParams = await params;
  const locale = String(resolvedParams?.locale || DEFAULT_LOCALE);
  
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow bg-gray-50">
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
          <PrivacyContent locale={locale === 'tw' ? 'zh-TW' : locale} />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}