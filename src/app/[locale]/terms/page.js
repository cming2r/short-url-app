import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DEFAULT_LOCALE } from '@/lib/i18n/constants';

// 使用普通組件，不需要客戶端的 useTranslation
const TermsContent = ({ locale }) => {
  // 中文內容
  const zhContent = (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">使用條款</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. 接受條款</h2>
          <p>歡迎使用我們的短網址服務。通過訪問或使用我們的服務，您同意受本使用條款的約束。如果您不同意這些條款，請勿使用我們的服務。</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. 服務描述</h2>
          <p>我們提供一個短網址創建服務，允許用戶將長網址轉換為短網址，便於分享和訪問。我們還提供基本的點擊分析和自定義短網址功能。</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. 用戶帳戶</h2>
          <p>某些功能可能需要您創建一個帳戶。您負責維護您帳戶的安全性，並對發生在您帳戶下的所有活動負責。您同意：</p>
          <ul className="list-disc ml-6 mt-2">
            <li>提供準確、完整的註冊信息</li>
            <li>保護您的帳戶密碼</li>
            <li>立即通知我們任何未授權使用您帳戶的情況</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. 禁止行為</h2>
          <p>使用我們的服務時，您不得：</p>
          <ul className="list-disc ml-6 mt-2">
            <li>違反任何適用法律或法規</li>
            <li>分享非法、有害、威脅、辱罵、騷擾、誹謗、淫穢或其他不適當內容</li>
            <li>從事任何可能損害、禁用或超負荷我們系統的活動</li>
            <li>未經授權訪問我們的系統或其他用戶的帳戶</li>
            <li>將我們的服務用於發送垃圾郵件或任何形式的未經請求的大規模通信</li>
            <li>使用我們的服務進行詐騙或網絡釣魚活動</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. 服務變更與終止</h2>
          <p>我們保留以下權利：</p>
          <ul className="list-disc ml-6 mt-2">
            <li>隨時修改或終止服務，無需事先通知</li>
            <li>刪除任何違反本條款的內容或用戶帳戶</li>
            <li>限制或禁止訪問我們的服務</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. 知識產權</h2>
          <p>我們的服務及其原始內容、功能和設計受知識產權法保護。您不得：</p>
          <ul className="list-disc ml-6 mt-2">
            <li>複製、修改或創建我們的服務的衍生作品</li>
            <li>解碼、反向工程或嘗試提取我們的源代碼</li>
            <li>移除任何版權、商標或其他所有權聲明</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. 免責聲明</h2>
          <p>我們的服務按"現狀"和"可用"的基礎提供，不提供任何明示或暗示的保證。我們不保證：</p>
          <ul className="list-disc ml-6 mt-2">
            <li>服務將不間斷、及時、安全或無錯誤</li>
            <li>服務將滿足您的特定需求或期望</li>
            <li>通過使用服務獲得的結果將準確或可靠</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. 責任限制</h2>
          <p>在法律允許的最大範圍內，我們不對任何直接、間接、偶然、特殊、懲罰性或後果性損害負責，無論這些損害是基於合同、侵權行為、嚴格責任或其他法律理論。</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. 彌償</h2>
          <p>您同意彌償、辯護並使我們及我們的關聯公司、管理人員、董事、員工和代理人免受因您使用我們的服務或違反本條款而產生的任何和所有索賠、損害、義務、損失、責任、成本或債務以及法律費用。</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. 適用法律</h2>
          <p>本條款受當地法律管轄，不考慮法律衝突原則。</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. 條款變更</h2>
          <p>我們保留隨時修改這些條款的權利。修改後的條款將在我們的網站上發布，並在發布時立即生效。繼續使用我們的服務將被視為接受修改後的條款。</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">12. 聯繫我們</h2>
          <p>如果您對本使用條款有任何疑問，請通過網站的聯繫方式與我們聯繫。</p>
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
      <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>Welcome to our URL shortening service. By accessing or using our service, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
          <p>We provide a URL shortening service that allows users to convert long URLs into shorter ones for easier sharing and access. We also offer basic click analytics and custom short URL features.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
          <p>Some features may require you to create an account. You are responsible for maintaining the security of your account and are fully responsible for all activities that occur under your account. You agree to:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Provide accurate and complete registration information</li>
            <li>Safeguard your account password</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Prohibited Conduct</h2>
          <p>When using our service, you must not:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Share illegal, harmful, threatening, abusive, harassing, defamatory, obscene, or otherwise objectionable content</li>
            <li>Engage in any activity that could damage, disable, or overburden our systems</li>
            <li>Access our systems or other users' accounts without authorization</li>
            <li>Use our service to send spam or any form of unsolicited mass communication</li>
            <li>Use our service for fraudulent or phishing activities</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Service Changes and Termination</h2>
          <p>We reserve the right to:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Modify or terminate the service at any time without prior notice</li>
            <li>Remove any content or user accounts that violate these terms</li>
            <li>Restrict or prohibit access to our service</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Intellectual Property</h2>
          <p>Our service and its original content, features, and functionality are protected by intellectual property laws. You may not:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Copy, modify, or create derivative works of our service</li>
            <li>Decompile, reverse engineer, or attempt to extract our source code</li>
            <li>Remove any copyright, trademark, or other proprietary notices</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Disclaimer</h2>
          <p>Our service is provided on an "as is" and "as available" basis, without any warranties of any kind. We do not guarantee that:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>The service will be uninterrupted, timely, secure, or error-free</li>
            <li>The service will meet your specific requirements or expectations</li>
            <li>Results obtained through the use of the service will be accurate or reliable</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, we shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, regardless of whether such damages are based on contract, tort, strict liability, or any other legal theory.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless us and our affiliates, officers, directors, employees, and agents from any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) arising from your use of our service or violation of these terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
          <p>These terms are governed by the laws of the local jurisdiction, without regard to its conflict of law principles.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Modified terms will be posted on our website and will be effective immediately upon posting. Continued use of our service will be deemed acceptance of the modified terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">12. Contact Us</h2>
          <p>If you have any questions about these Terms of Service, please contact us through the contact information provided on our website.</p>
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

export default async function TermsPage({ params }) {
  const resolvedParams = await params;
  const locale = String(resolvedParams?.locale || DEFAULT_LOCALE);
  
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow bg-gray-50">
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
          <TermsContent locale={locale === 'tw' ? 'zh-TW' : locale} />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}