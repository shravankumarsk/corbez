import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - User Agreement & Legal Terms',
  description: 'Corbez Terms of Service: User agreements for employees, restaurants, and companies. Learn about discount terms, prohibited activities, and your rights and responsibilities.',
  keywords: [
    'terms of service',
    'user agreement',
    'terms and conditions',
    'legal terms',
    'service terms',
  ],
  openGraph: {
    title: 'Corbez Terms of Service',
    description: 'Read our Terms of Service to understand your rights and responsibilities when using Corbez.',
    url: 'https://corbez.com/terms',
    type: 'website',
  },
  alternates: {
    canonical: 'https://corbez.com/terms',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-600 mb-8">
          <strong>Last Updated:</strong> December 30, 2025
        </p>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              Welcome to Corbez! These Terms of Service ("Terms") govern your access to and use of corbez.com (the "Platform" or "Service"), operated by Corbez ("we," "our," or "us").
            </p>
            <p className="text-gray-700 mb-4">
              By accessing or using our Service, you agree to be bound by these Terms and our <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>. If you do not agree to these Terms, you may not use the Service.
            </p>
            <p className="text-gray-700 mb-4">
              <strong>IMPORTANT:</strong> These Terms contain an arbitration clause and class action waiver (Section 18). Please read carefully.
            </p>
          </section>

          {/* Service Description */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
            <p className="text-gray-700 mb-4">
              Corbez is a three-sided marketplace that connects:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Employees:</strong> Corporate employees seeking exclusive discounts at local restaurants</li>
              <li><strong>Restaurants (Merchants):</strong> Food establishments offering discounts to attract corporate customers</li>
              <li><strong>Companies (Employers):</strong> Organizations providing this benefit to their employees</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We facilitate the creation, distribution, and redemption of discount coupons through QR code technology. We do not directly provide restaurant services or employment services.
            </p>
          </section>

          {/* Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Eligibility</h2>
            <p className="text-gray-700 mb-4">You must meet the following requirements to use our Service:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Be at least 18 years of age</li>
              <li>Have the legal capacity to enter into binding contracts</li>
              <li>Not be prohibited from using the Service under applicable law</li>
              <li>Provide accurate and complete registration information</li>
              <li><strong>For Employees:</strong> Be employed by a company that partners with Corbez or have received a valid invitation code</li>
              <li><strong>For Merchants:</strong> Operate a legitimate food service business with proper licensing</li>
              <li><strong>For Company Admins:</strong> Have authority to bind your organization to these Terms</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Account Registration and Security</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Account Creation</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>You must provide accurate, current, and complete information during registration</li>
              <li>You are responsible for maintaining the confidentiality of your password</li>
              <li>You agree to notify us immediately of any unauthorized use of your account</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>One person or entity may not maintain more than one account</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Account Verification</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Email Verification:</strong> You must verify your email address to activate your account</li>
              <li><strong>Merchant Verification:</strong> Merchants must provide business documentation (license, tax ID, proof of address) for approval</li>
              <li><strong>Company Verification:</strong> Company admins may be required to verify company ownership and authority</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Account Security</h3>
            <p className="text-gray-700 mb-4">
              We strongly recommend enabling multi-factor authentication (MFA). We are not liable for any loss or damage arising from your failure to maintain account security.
            </p>
          </section>

          {/* User Roles and Responsibilities */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Roles and Responsibilities</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Employee Responsibilities</h3>
            <p className="text-gray-700 mb-4">As an employee user, you agree to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Use your company email address for registration</li>
              <li>Only claim discounts you intend to personally use</li>
              <li>Not share, sell, or transfer your coupons to others</li>
              <li>Present valid QR codes at the time of redemption</li>
              <li>Respect merchant policies and operating hours</li>
              <li>Not abuse the claiming system (excessive claiming, fraud, etc.)</li>
              <li>Report any merchants who refuse to honor valid coupons</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Merchant Responsibilities</h3>
            <p className="text-gray-700 mb-4">As a merchant user, you agree to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Provide accurate business information and keep it updated</li>
              <li>Maintain all necessary business licenses and permits</li>
              <li>Honor all active discounts and promotions you create</li>
              <li>Accept valid coupons presented by employees</li>
              <li>Verify QR codes using our merchant verification system</li>
              <li>Not discriminate against coupon users</li>
              <li>Report fraudulent coupon usage to Corbez</li>
              <li>Comply with all food safety and health regulations</li>
              <li>Pay applicable platform fees on time</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 Company Admin Responsibilities</h3>
            <p className="text-gray-700 mb-4">As a company admin, you agree to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Only invite current employees of your organization</li>
              <li>Remove access for employees who leave the company</li>
              <li>Monitor your company's usage for potential abuse</li>
              <li>Pay applicable subscription fees on time</li>
              <li>Notify us of any suspected fraudulent activity</li>
              <li>Maintain accurate employee records</li>
            </ul>
          </section>

          {/* Discount Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Discount Terms and Coupon Usage</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Claiming Coupons</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Employees may have <strong>one active coupon per merchant</strong> at any time</li>
              <li>Coupons are non-transferable and must be used by the claiming employee</li>
              <li>Merchants set discount percentage, terms, and monthly usage limits</li>
              <li>Coupons do not expire unless explicitly stated by the merchant</li>
              <li>We reserve the right to block accounts showing suspicious claiming patterns</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Redeeming Coupons</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Present your QR code to the merchant at the time of payment</li>
              <li>Coupons apply to the bill total before tax and tip</li>
              <li>Discounts cannot be combined with other promotions unless explicitly allowed</li>
              <li>Merchants may set minimum purchase requirements</li>
              <li>Merchants may restrict discount usage to certain days/times</li>
              <li>Once redeemed, coupons are marked as used and cannot be reused</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.3 Monthly Usage Limits</h3>
            <p className="text-gray-700 mb-4">
              If a merchant sets a monthly usage limit (e.g., "3 uses per month"), your usage counter resets on the first day of each calendar month. Exceeding the limit will prevent redemption until the next month.
            </p>
          </section>

          {/* Payment Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Payment Terms</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Merchant Fees (Coming Soon)</h3>
            <p className="text-gray-700 mb-4">
              Currently, merchant registration is free. In the future, we may charge:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Monthly subscription fees based on tier (Basic, Pro, Enterprise)</li>
              <li>Transaction fees per coupon redemption (% of discount value)</li>
              <li>Premium feature fees (e.g., analytics, priority placement)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We will provide 30 days' notice before implementing any fees.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Company Subscription Fees (Coming Soon)</h3>
            <p className="text-gray-700 mb-4">
              Company admins may be required to pay subscription fees based on number of employees or usage volume. Pricing will be communicated before implementation.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 Payment Processing</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>All payments are processed through Stripe, a PCI-DSS compliant payment processor</li>
              <li>You authorize us to charge your payment method on file</li>
              <li>Fees are non-refundable except as required by law</li>
              <li>We may suspend access for non-payment after 7 days of overdue invoices</li>
            </ul>
          </section>

          {/* Prohibited Activities */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Prohibited Activities</h2>
            <p className="text-gray-700 mb-4">You may NOT:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Create fake accounts or provide false information</li>
              <li>Share, sell, or transfer your account or coupons</li>
              <li>Claim coupons you do not intend to personally use</li>
              <li>Claim excessive coupons in a short time period (spam)</li>
              <li>Use automated tools (bots, scrapers) to interact with the Platform</li>
              <li>Reverse engineer, decompile, or hack the Platform</li>
              <li>Bypass security measures or rate limits</li>
              <li>Impersonate another person or entity</li>
              <li>Harass, threaten, or abuse other users or merchants</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Create fraudulent QR codes or forge coupons</li>
              <li><strong>For Merchants:</strong> Refuse valid coupons, discriminate against coupon users, or create fake discounts</li>
            </ul>
          </section>

          {/* Content and Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Content and Intellectual Property</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">9.1 Your Content</h3>
            <p className="text-gray-700 mb-4">
              You retain ownership of content you upload (profile photos, business descriptions, logos, etc.). By uploading content, you grant Corbez a worldwide, royalty-free license to use, display, and distribute your content on the Platform.
            </p>
            <p className="text-gray-700 mb-4">You represent and warrant that:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>You own or have rights to the content you upload</li>
              <li>Your content does not infringe third-party rights</li>
              <li>Your content complies with these Terms and applicable laws</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">9.2 Our Content</h3>
            <p className="text-gray-700 mb-4">
              All Platform content, design, code, logos, and trademarks are owned by Corbez or our licensors. You may not copy, modify, distribute, or create derivative works without our written permission.
            </p>
          </section>

          {/* Moderation and Enforcement */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Moderation and Enforcement</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">10.1 Our Rights</h3>
            <p className="text-gray-700 mb-4">We reserve the right to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Approve or reject merchant applications</li>
              <li>Remove or edit content that violates these Terms</li>
              <li>Suspend or terminate accounts for Terms violations</li>
              <li>Block suspicious IP addresses or devices</li>
              <li>Investigate fraudulent activity and cooperate with law enforcement</li>
              <li>Modify or discontinue the Service at any time</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">10.2 Three-Strike Policy for Merchants</h3>
            <p className="text-gray-700 mb-4">
              Merchants who violate Terms (e.g., refusing valid coupons, creating fake discounts) will receive:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Strike 1:</strong> Warning and 7-day probation</li>
              <li><strong>Strike 2:</strong> 30-day suspension from the Platform</li>
              <li><strong>Strike 3:</strong> Permanent account termination</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">10.3 Fraud Detection</h3>
            <p className="text-gray-700 mb-4">
              We use automated fraud detection systems to identify suspicious activity. If your account is flagged, we may:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Request additional verification (ID, business license, etc.)</li>
              <li>Temporarily suspend claiming/redemption privileges</li>
              <li>Permanently ban accounts for confirmed fraud</li>
            </ul>
          </section>

          {/* Account Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Account Termination</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.1 Termination by You</h3>
            <p className="text-gray-700 mb-4">
              You may delete your account at any time through Settings → Account → Delete Account. Upon deletion:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Your account is immediately deactivated</li>
              <li>Active coupons are invalidated</li>
              <li>Personal data is deleted after 30 days (subject to legal retention requirements)</li>
              <li>Transaction records may be retained for tax/accounting purposes (7 years)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.2 Termination by Us</h3>
            <p className="text-gray-700 mb-4">
              We may suspend or terminate your account immediately if:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>You violate these Terms</li>
              <li>Your account is flagged for fraud or abuse</li>
              <li>You fail to pay applicable fees</li>
              <li>We are required to do so by law</li>
              <li>We discontinue the Service</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">11.3 Effects of Termination</h3>
            <p className="text-gray-700 mb-4">
              Upon termination, your right to use the Service immediately ceases. Sections that by their nature should survive termination (including liability limitations, indemnification, and dispute resolution) will remain in effect.
            </p>
          </section>

          {/* Disclaimers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Disclaimers</h2>
            <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200 mb-4">
              <p className="text-gray-700 mb-4">
                <strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.</strong>
              </p>
              <p className="text-gray-700 mb-4">We disclaim all warranties, including but not limited to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Merchantability, fitness for a particular purpose, and non-infringement</li>
                <li>Accuracy, reliability, or availability of the Service</li>
                <li>Uninterrupted or error-free operation</li>
                <li>Security of data transmission or storage</li>
              </ul>
            </div>
            <p className="text-gray-700 mb-4">
              <strong>We are not responsible for:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Quality, safety, or legality of restaurant services</li>
              <li>Conduct of merchants or other users</li>
              <li>Merchant refusal to honor discounts (though we will investigate and enforce our Terms)</li>
              <li>Food safety, hygiene, or health code violations at merchant locations</li>
              <li>Disputes between employees and merchants</li>
              <li>Third-party services (Stripe, Vercel, MongoDB, etc.)</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Limitation of Liability</h2>
            <div className="bg-red-50 p-6 rounded-lg border border-red-200 mb-4">
              <p className="text-gray-700 mb-4">
                <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW, CORBEZ AND ITS OFFICERS, DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR:</strong>
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Indirect, incidental, consequential, special, or punitive damages</li>
                <li>Loss of profits, revenue, data, or business opportunities</li>
                <li>Personal injury or property damage</li>
                <li>Food poisoning or illness from merchant services</li>
                <li>Unauthorized access to your account</li>
              </ul>
            </div>
            <p className="text-gray-700 mb-4">
              <strong>OUR TOTAL LIABILITY TO YOU SHALL NOT EXCEED THE GREATER OF:</strong>
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>$100 USD, or</li>
              <li>The amount you paid to Corbez in the past 12 months</li>
            </ul>
          </section>

          {/* Indemnification */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Indemnification</h2>
            <p className="text-gray-700 mb-4">
              You agree to indemnify, defend, and hold harmless Corbez from any claims, damages, losses, liabilities, and expenses (including attorney's fees) arising from:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of third-party rights</li>
              <li>Your content or conduct on the Platform</li>
              <li>Fraudulent or illegal activity associated with your account</li>
            </ul>
          </section>

          {/* Third-Party Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Third-Party Services and Links</h2>
            <p className="text-gray-700 mb-4">
              Our Service integrates with third-party services (Stripe for payments, Vercel for hosting, MongoDB for database). We are not responsible for the availability, accuracy, or content of these services.
            </p>
            <p className="text-gray-700 mb-4">
              Links to merchant websites or third-party sites are provided for convenience only. We do not endorse or assume responsibility for their content or practices.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Governing Law and Jurisdiction</h2>
            <p className="text-gray-700 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to conflict of law principles.
            </p>
            <p className="text-gray-700 mb-4">
              You agree to submit to the exclusive jurisdiction of courts located in San Francisco County, California for resolution of any disputes.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. Changes to These Terms</h2>
            <p className="text-gray-700 mb-4">
              We may update these Terms from time to time. Material changes will be communicated via:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Email notification to your registered address</li>
              <li>Prominent notice on the Platform</li>
              <li>Updated "Last Updated" date at the top of this page</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms. If you do not agree, you must stop using the Service and delete your account.
            </p>
          </section>

          {/* Arbitration and Class Action Waiver */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">18. Dispute Resolution, Arbitration, and Class Action Waiver</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">18.1 Informal Resolution</h3>
            <p className="text-gray-700 mb-4">
              Before filing a claim, you agree to contact us at <a href="mailto:contact@corbez.com" className="text-blue-600 hover:underline">contact@corbez.com</a> and attempt to resolve the dispute informally for at least 30 days.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">18.2 Binding Arbitration</h3>
            <p className="text-gray-700 mb-4">
              If informal resolution fails, you agree that any dispute will be resolved through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules.
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Arbitration will be conducted in San Francisco, California or remotely</li>
              <li>The arbitrator's decision is final and binding</li>
              <li>You waive the right to a jury trial</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">18.3 Class Action Waiver</h3>
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <p className="text-gray-700 mb-2">
                <strong>YOU AGREE TO BRING CLAIMS ONLY IN YOUR INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY CLASS ACTION, COLLECTIVE ACTION, OR REPRESENTATIVE PROCEEDING.</strong>
              </p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">18.4 Exceptions</h3>
            <p className="text-gray-700 mb-4">
              Either party may seek injunctive relief in court to protect intellectual property rights or prevent fraudulent activity.
            </p>
          </section>

          {/* Miscellaneous */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">19. Miscellaneous</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">19.1 Entire Agreement</h3>
            <p className="text-gray-700 mb-4">
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Corbez.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">19.2 Severability</h3>
            <p className="text-gray-700 mb-4">
              If any provision is found unenforceable, the remaining provisions will remain in full force.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">19.3 Waiver</h3>
            <p className="text-gray-700 mb-4">
              Our failure to enforce any right or provision does not constitute a waiver of future enforcement.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">19.4 Assignment</h3>
            <p className="text-gray-700 mb-4">
              You may not assign these Terms without our written consent. We may assign these Terms to any successor or affiliate.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">19.5 Force Majeure</h3>
            <p className="text-gray-700 mb-4">
              We are not liable for delays or failures due to events beyond our reasonable control (natural disasters, strikes, government actions, etc.).
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">20. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about these Terms, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:contact@corbez.com" className="text-blue-600 hover:underline">
                  contact@corbez.com
                </a>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Subject Line:</strong> Terms of Service Inquiry
              </p>
              <p className="text-gray-700">
                <strong>Response Time:</strong> Within 48 hours for general inquiries
              </p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acknowledgment</h3>
            <p className="text-gray-700">
              By using Corbez, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
