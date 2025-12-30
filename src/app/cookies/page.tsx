import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'

export default function CookiesPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-secondary mb-8">Cookie Policy</h1>
          <p className="text-muted mb-8">Last updated: December 2024</p>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">What Are Cookies?</h2>
              <p className="text-gray-600 mb-4">
                Cookies are small text files stored on your device when you visit a website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">How We Use Cookies</h2>
              <p className="text-gray-600 mb-4">corbez uses cookies for the following purposes:</p>

              <h3 className="text-xl font-semibold text-secondary mb-2">Essential Cookies</h3>
              <p className="text-gray-600 mb-4">
                These cookies are necessary for the website to function properly. They enable core features like user authentication, security, and session management.
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Session cookies to keep you logged in</li>
                <li>Security cookies to prevent fraud</li>
                <li>Load balancing cookies</li>
              </ul>

              <h3 className="text-xl font-semibold text-secondary mb-2">Functional Cookies</h3>
              <p className="text-gray-600 mb-4">
                These cookies remember your preferences and settings to enhance your experience.
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Language preferences</li>
                <li>Display settings</li>
                <li>Recently viewed items</li>
              </ul>

              <h3 className="text-xl font-semibold text-secondary mb-2">Analytics Cookies</h3>
              <p className="text-gray-600 mb-4">
                These cookies help us understand how visitors interact with our website, allowing us to improve our service.
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li>Page visit statistics</li>
                <li>Traffic sources</li>
                <li>User behavior patterns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">Third-Party Cookies</h2>
              <p className="text-gray-600 mb-4">
                We may use third-party services that set their own cookies:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li><strong>Stripe:</strong> For secure payment processing</li>
                <li><strong>Analytics providers:</strong> To understand usage patterns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">Managing Cookies</h2>
              <p className="text-gray-600 mb-4">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies through their settings</li>
                <li><strong>Third-party tools:</strong> Various browser extensions can help manage cookies</li>
                <li><strong>Opt-out links:</strong> Many analytics providers offer opt-out mechanisms</li>
              </ul>
              <p className="text-gray-600 mb-4">
                Please note that disabling certain cookies may affect the functionality of our service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">Cookie Retention</h2>
              <p className="text-gray-600 mb-4">
                Different cookies have different lifespans:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
                <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent cookies:</strong> Remain for a set period (typically 30 days to 1 year)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">Updates to This Policy</h2>
              <p className="text-gray-600 mb-4">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-secondary mb-4">Contact Us</h2>
              <p className="text-gray-600">
                If you have questions about our use of cookies, please contact us at: privacy@corbez.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
