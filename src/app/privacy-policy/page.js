// English version of privacy policy page
import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// English content component
const PrivacyContent = () => (
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

// English version metadata
export const metadata = {
  title: 'Privacy Policy | vvrl.cc URL Shortener',
  description: 'Privacy Policy for vvrl.cc URL shortening service. Learn how we collect, use, and protect your information.',
  alternates: {
    canonical: 'https://vvrl.cc/privacy-policy',
  },
};

export default function PrivacyPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow bg-gray-50">
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
          <PrivacyContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}