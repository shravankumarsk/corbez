import { Navbar, Footer } from '@/components/landing'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help & Support | Corbez',
  description: 'Get help with your Corbez account. Contact our support team at hello@corbez.com for assistance.',
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-20 md:pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              How Can We Help You?
            </h1>
            <p className="text-lg text-muted">
              We&apos;re here to help. Reach out via email or check our resources below.
            </p>
          </div>

          {/* Support Email - PRIMARY */}
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-100 shadow-sm mb-12 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-3">Email Support</h2>
            <p className="text-muted mb-6">
              Our support team typically responds within 24 hours on business days.
            </p>
            <a
              href="mailto:contact@corbez.com"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              contact@corbez.com
            </a>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-2 gap-6">
            <a
              href="/faq"
              className="bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-1 group-hover:text-primary transition-colors">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-sm text-muted">
                    Find answers to common questions about Corbez
                  </p>
                </div>
              </div>
            </a>

            <a
              href="/contact"
              className="bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-1 group-hover:text-primary transition-colors">
                    Contact Us
                  </h3>
                  <p className="text-sm text-muted">
                    Send us a detailed message through our contact form
                  </p>
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
