import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-secondary mb-8">Terms of Service</h1>
          <p className="text-muted mb-8">Last updated: December 2024</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing or using corbez (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">2. Description of Service</h2>
              <p className="text-gray-600 mb-4">
                corbez is a platform that connects verified corporate employees with participating restaurants offering exclusive discounts. We provide verification services and digital passes for employees, and scanner tools for restaurant partners.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">3. User Accounts</h2>
              <h3 className="text-xl font-semibold text-secondary mb-2">For Employees</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>You must provide accurate employment information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You may not share your verification credentials</li>
                <li>False verification claims may result in account termination</li>
              </ul>
              <h3 className="text-xl font-semibold text-secondary mb-2">For Restaurants</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>You must be authorized to represent your business</li>
                <li>You agree to honor posted discount rates</li>
                <li>Subscription fees are billed monthly</li>
                <li>A 6-month free trial is provided for new accounts</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">4. Fees and Payment</h2>
              <p className="text-gray-600 mb-4">
                <strong>For Employees:</strong> The service is free to use.
              </p>
              <p className="text-gray-600 mb-4">
                <strong>For Restaurants:</strong> After a 6-month free trial, a monthly subscription fee of $9.99 applies. Payments are processed securely through Stripe. You may cancel at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">5. Prohibited Conduct</h2>
              <p className="text-gray-600 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Provide false verification information</li>
                <li>Share your account or credentials</li>
                <li>Attempt to circumvent security measures</li>
                <li>Use the service for any illegal purpose</li>
                <li>Interfere with the proper operation of the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">6. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                All content, features, and functionality of the Service are owned by corbez and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                corbez is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">8. Termination</h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your account at any time for violation of these terms. You may delete your account at any time through your account settings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">9. Changes to Terms</h2>
              <p className="text-gray-600 mb-4">
                We may update these terms from time to time. We will notify you of any material changes via email or through the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">10. Contact</h2>
              <p className="text-gray-600">
                For questions about these Terms, contact us at: legal@corbez.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
