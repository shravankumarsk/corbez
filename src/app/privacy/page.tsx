import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Corbez',
  description: 'Privacy Policy for Corbez - Corporate Benefits Marketplace',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">
          <strong>Last Updated:</strong> December 30, 2025
        </p>

        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              Welcome to Corbez ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our corporate benefits marketplace platform at corbez.com (the "Service").
            </p>
            <p className="text-gray-700 mb-4">
              By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Information You Provide</h3>
            <p className="text-gray-700 mb-4">
              We collect information that you voluntarily provide when using our Service:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Account Information:</strong> Name, email address, password (encrypted), company name, job title</li>
              <li><strong>Company Information (for Company Admins):</strong> Company name, address, industry, size, contact details</li>
              <li><strong>Business Information (for Merchants):</strong> Business name, address, license information, cuisine type, operating hours, contact details, banking information</li>
              <li><strong>Profile Information:</strong> Profile photo, preferences, communication settings</li>
              <li><strong>Communications:</strong> Messages sent through our platform, customer support inquiries</li>
              <li><strong>Payment Information:</strong> Credit card details (processed securely through Stripe - we do not store full card numbers)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Information Collected Automatically</h3>
            <p className="text-gray-700 mb-4">
              When you access our Service, we automatically collect:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns, features used</li>
              <li><strong>Location Data:</strong> Approximate location based on IP address (with your consent for precise location)</li>
              <li><strong>Cookies and Tracking:</strong> Session cookies, authentication tokens, analytics cookies</li>
              <li><strong>Security Logs:</strong> Login attempts, security events, fraud detection data</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Information from Third Parties</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Single Sign-On (SSO):</strong> If you sign up using third-party services (Google, Microsoft), we receive basic profile information</li>
              <li><strong>Payment Processors:</strong> Transaction data from Stripe for billing purposes</li>
              <li><strong>Business Verification:</strong> Publicly available business information for merchant verification</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your information for the following purposes:</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Service Delivery</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Create and manage your account</li>
              <li>Process discount claims and redemptions</li>
              <li>Generate QR codes for coupon verification</li>
              <li>Match employees with relevant merchant offers</li>
              <li>Facilitate communication between users and merchants</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Business Operations</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Process payments and manage billing</li>
              <li>Verify merchant business legitimacy</li>
              <li>Approve or reject merchant applications</li>
              <li>Monitor platform usage and performance</li>
              <li>Generate analytics and insights (aggregated and anonymized)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Security and Fraud Prevention</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Detect and prevent fraudulent activity</li>
              <li>Identify suspicious usage patterns (excessive claiming, account sharing)</li>
              <li>Enforce our Terms of Service and prevent abuse</li>
              <li>Maintain audit logs for security investigations</li>
              <li>Comply with legal obligations and protect our rights</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.4 Communication</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Send transactional emails (account verification, password reset, claim confirmations)</li>
              <li>Notify you of new merchant partners (if opted in)</li>
              <li>Send weekly usage digests (if opted in)</li>
              <li>Provide customer support responses</li>
              <li>Send important service updates and policy changes</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">3.5 Improvement and Development</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Improve platform functionality and user experience</li>
              <li>Develop new features based on usage patterns</li>
              <li>Conduct A/B testing and research</li>
              <li>Train fraud detection algorithms</li>
            </ul>
          </section>

          {/* Legal Basis for Processing (GDPR) */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Legal Basis for Processing (GDPR)</h2>
            <p className="text-gray-700 mb-4">
              If you are located in the European Economic Area (EEA), our legal basis for collecting and using your information depends on the data and context:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Contract Performance:</strong> Processing necessary to provide the Service you requested</li>
              <li><strong>Legitimate Interest:</strong> Fraud prevention, security, analytics, service improvement</li>
              <li><strong>Consent:</strong> Marketing communications, location tracking, optional features (you can withdraw anytime)</li>
              <li><strong>Legal Obligation:</strong> Compliance with laws, tax requirements, law enforcement requests</li>
            </ul>
          </section>

          {/* How We Share Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. How We Share Your Information</h2>
            <p className="text-gray-700 mb-4">We do not sell your personal information. We share information only in the following circumstances:</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 With Service Providers</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Payment Processing:</strong> Stripe (PCI-DSS compliant payment processor)</li>
              <li><strong>Cloud Hosting:</strong> Vercel (hosting), MongoDB Atlas (database)</li>
              <li><strong>Email Delivery:</strong> Resend (transactional emails)</li>
              <li><strong>Analytics:</strong> Vercel Analytics (privacy-focused, no personal data sold)</li>
            </ul>
            <p className="text-gray-700 mb-4 italic">
              All service providers are contractually obligated to protect your data and use it only for specified purposes.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 With Merchants (Limited Information)</h3>
            <p className="text-gray-700 mb-4">
              When you redeem a coupon, we share <strong>only the necessary information</strong> with the merchant:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>First name and last initial (e.g., "John D.")</li>
              <li>Company name (to verify eligibility)</li>
              <li>Discount amount and terms</li>
              <li>Coupon expiration date</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We <strong>do not share</strong> your full name, email, phone number, or other personal details with merchants.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.3 With Your Company (for Employees)</h3>
            <p className="text-gray-700 mb-4">
              If you join as an employee, your company admin can see:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Your name and email (to manage team members)</li>
              <li>Aggregated usage statistics (number of employees using the platform, most popular merchants)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We <strong>do not share</strong> individual redemption details, specific restaurants visited, or spending amounts.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.4 Legal Requirements</h3>
            <p className="text-gray-700 mb-4">We may disclose your information if required by law or in response to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Valid legal process (subpoena, court order, search warrant)</li>
              <li>Government or regulatory requests</li>
              <li>Protection of our rights, property, or safety</li>
              <li>Investigation of fraud, security issues, or Terms violations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">5.5 Business Transfers</h3>
            <p className="text-gray-700 mb-4">
              If Corbez is involved in a merger, acquisition, or sale of assets, your information may be transferred. We will notify you before your information is transferred and becomes subject to a different privacy policy.
            </p>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 mb-4">We retain your information for as long as necessary to provide the Service and comply with legal obligations:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Account Data:</strong> Retained while your account is active, deleted 30 days after account closure (unless required for legal reasons)</li>
              <li><strong>Transaction Records:</strong> 7 years (tax and accounting requirements)</li>
              <li><strong>Audit Logs:</strong> 90 days (security and fraud investigation)</li>
              <li><strong>QR Codes:</strong> 30 days after coupon expiration or redemption</li>
              <li><strong>Marketing Communications:</strong> Until you unsubscribe</li>
              <li><strong>Anonymized Analytics:</strong> Indefinitely (cannot be linked back to you)</li>
            </ul>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 GDPR Rights (EEA Residents)</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
              <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your data</li>
              <li><strong>Right to Restriction:</strong> Limit how we use your data</li>
              <li><strong>Right to Data Portability:</strong> Receive your data in a machine-readable format</li>
              <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
              <li><strong>Right to Withdraw Consent:</strong> Withdraw consent for marketing, location tracking, etc.</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 CCPA Rights (California Residents)</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Right to Know:</strong> What personal information we collect and how it's used</li>
              <li><strong>Right to Delete:</strong> Request deletion of your information</li>
              <li><strong>Right to Opt-Out:</strong> We do not sell personal information, so no opt-out needed</li>
              <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">7.3 How to Exercise Your Rights</h3>
            <p className="text-gray-700 mb-4">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:contact@corbez.com" className="text-blue-600 hover:underline">
                contact@corbez.com
              </a>{' '}
              with the subject line "Privacy Rights Request." We will respond within 30 days.
            </p>
            <p className="text-gray-700 mb-4">
              You can also manage some settings directly in your account:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Update profile information</li>
              <li>Change email notification preferences</li>
              <li>Delete your account (Settings → Account → Delete Account)</li>
            </ul>
          </section>

          {/* Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for authentication, security, session management (cannot be disabled)</li>
              <li><strong>Analytics Cookies:</strong> Understand how users interact with the platform (can be disabled)</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
            </ul>
            <p className="text-gray-700 mb-4">
              You can control cookies through your browser settings. Note that disabling essential cookies may prevent you from using certain features.
            </p>
          </section>

          {/* Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Security Measures</h2>
            <p className="text-gray-700 mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li><strong>Encryption:</strong> TLS 1.3 for data in transit, AES-256 for sensitive data at rest</li>
              <li><strong>Password Security:</strong> bcrypt hashing with salt (12 rounds)</li>
              <li><strong>Access Controls:</strong> Role-based access, multi-factor authentication (MFA) available</li>
              <li><strong>Rate Limiting:</strong> Prevents brute force attacks and API abuse</li>
              <li><strong>Fraud Detection:</strong> Real-time monitoring for suspicious activity</li>
              <li><strong>Security Headers:</strong> CSP, HSTS, X-Frame-Options, XSS protection</li>
              <li><strong>Regular Audits:</strong> Security assessments and penetration testing</li>
              <li><strong>Incident Response:</strong> 24-hour response plan for security breaches</li>
            </ul>
            <p className="text-gray-700 mb-4">
              While we strive to protect your information, no method of transmission over the internet is 100% secure. Please use strong passwords and enable MFA for additional protection.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our Service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we discover that we have collected information from a child, we will delete it immediately. If you believe we have collected information from a child, please contact us at{' '}
              <a href="mailto:contact@corbez.com" className="text-blue-600 hover:underline">
                contact@corbez.com
              </a>.
            </p>
          </section>

          {/* International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws.
            </p>
            <p className="text-gray-700 mb-4">
              For EEA residents: We use Standard Contractual Clauses (SCCs) approved by the European Commission to ensure adequate protection when transferring data outside the EEA.
            </p>
          </section>

          {/* Third-Party Links */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Third-Party Links</h2>
            <p className="text-gray-700 mb-4">
              Our Service may contain links to third-party websites (e.g., merchant websites). We are not responsible for the privacy practices of these sites. We encourage you to read their privacy policies before providing any information.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-2">
              <li>Posting the updated policy on this page with a new "Last Updated" date</li>
              <li>Sending an email notification to your registered email address</li>
              <li>Displaying a prominent notice on the platform</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Your continued use of the Service after changes become effective constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:contact@corbez.com" className="text-blue-600 hover:underline">
                  contact@corbez.com
                </a>
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Subject Line:</strong> Privacy Inquiry
              </p>
              <p className="text-gray-700 mb-2">
                <strong>Response Time:</strong> Within 48 hours for general inquiries, 30 days for formal rights requests
              </p>
            </div>
          </section>

          {/* Data Protection Officer */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Data Protection Officer (DPO)</h2>
            <p className="text-gray-700 mb-4">
              For GDPR-related inquiries, you can contact our Data Protection Officer at{' '}
              <a href="mailto:contact@corbez.com" className="text-blue-600 hover:underline">
                contact@corbez.com
              </a>{' '}
              with the subject line "DPO - GDPR Inquiry."
            </p>
          </section>

          {/* Supervisory Authority */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. Supervisory Authority</h2>
            <p className="text-gray-700 mb-4">
              If you are located in the EEA and believe we have not addressed your concerns adequately, you have the right to lodge a complaint with your local data protection supervisory authority.
            </p>
          </section>

          {/* Acknowledgment */}
          <section className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Acknowledgment</h3>
            <p className="text-gray-700">
              By using Corbez, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
