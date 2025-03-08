// English version of terms page
import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// English content component
const TermsContent = () => (
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

// English version metadata
export const metadata = {
  title: 'Terms of Service | vvrl.cc URL Shortener',
  description: 'Terms of Service for vvrl.cc URL shortening service. Learn about our rules, policies, and guidelines.',
  alternates: {
    canonical: 'https://vvrl.cc/terms',
  },
};

export default function TermsPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow bg-gray-50">
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
          <TermsContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}