import { Navbar, Footer } from '@/components/landing'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              About Corbe
            </h1>
            <p className="text-xl text-muted">
              We&apos;re building a bridge between corporate employees and local restaurants,
              creating value for everyone involved.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-secondary mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted mb-4">
                corbez was founded with a simple idea: corporate employees deserve better dining perks,
                and local restaurants deserve access to reliable, high-quality customers.
              </p>
              <p className="text-lg text-muted mb-4">
                We created a verification system that&apos;s simple for employees to use and
                affordable for restaurants to join. No complicated integrations, no expensive
                hardware &mdash; just a straightforward solution that works.
              </p>
              <p className="text-lg text-muted">
                Today, we&apos;re helping thousands of employees save on their meals while
                driving new business to local restaurants.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <div className="text-sm text-muted">Corporate Partners</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-primary mb-2">25K+</div>
                  <div className="text-sm text-muted">Verified Employees</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-primary mb-2">150+</div>
                  <div className="text-sm text-muted">Partner Restaurants</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="text-3xl font-bold text-primary mb-2">$2M+</div>
                  <div className="text-sm text-muted">Employee Savings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-3">Trust & Verification</h3>
              <p className="text-muted">
                We verify every employee through their corporate email or company-issued invite codes.
                Restaurants can trust that discounts go to the right people.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-3">Simplicity</h3>
              <p className="text-muted">
                No complicated apps or hardware. Employees use their digital wallet,
                restaurants use their existing devices. It just works.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border border-gray-100">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-3">Fair Value</h3>
              <p className="text-muted">
                $9.99/month for restaurants (after 6 months free) is accessible to businesses of all sizes.
                Employees use the service for free. Everyone benefits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to join us?
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-8">
            Whether you&apos;re an employee looking for dining perks or a restaurant
            wanting to attract new customers, we&apos;d love to have you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/contact"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
