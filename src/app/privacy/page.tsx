import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-secondary mb-8">Privacy Policy</h1>
          <p className="text-muted mb-8">Last updated: December 2024</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">1. Introduction</h2>
              <p className="text-gray-600 mb-4">
                corbez (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our corporate benefits platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-semibold text-secondary mb-2">Personal Information</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Name and email address</li>
                <li>Company/employer information</li>
                <li>Account credentials</li>
                <li>Payment information (for restaurant partners)</li>
              </ul>
              <h3 className="text-xl font-semibold text-secondary mb-2">Usage Information</h3>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Verification history</li>
                <li>Device and browser information</li>
                <li>IP address and location data</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Verify your corporate employment status</li>
                <li>Enable discount verification at partner restaurants</li>
                <li>Process payments from restaurant partners</li>
                <li>Communicate with you about your account</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">4. Information Sharing</h2>
              <p className="text-gray-600 mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Partner restaurants (verification status only)</li>
                <li>Your employer (upon their request for verification purposes)</li>
                <li>Service providers who assist our operations</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">5. Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">6. Your Rights</h2>
              <p className="text-gray-600 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and data</li>
                <li>Object to certain processing</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">7. Cookies</h2>
              <p className="text-gray-600 mb-4">
                We use cookies and similar technologies to enhance your experience. See our <a href="/cookies" className="text-primary hover:text-primary-dark">Cookie Policy</a> for more details.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">8. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-gray-600">
                Email: privacy@corbez.com<br />
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
