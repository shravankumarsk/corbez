import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              Join the <span className="text-primary">corbez</span> team
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              We&apos;re building the future of corporate benefits. Help us connect workplaces with their local food communities.
            </p>
          </div>

          {/* Culture Section */}
          <div className="bg-background rounded-2xl p-8 mb-12">
            <h2 className="text-2xl font-bold text-secondary mb-6">Our Culture</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-secondary mb-2">Move Fast</h3>
                <p className="text-muted text-sm">We ship quickly and iterate based on real feedback.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-secondary mb-2">Build Together</h3>
                <p className="text-muted text-sm">Collaboration is at the heart of everything we do.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-secondary mb-2">Care Deeply</h3>
                <p className="text-muted text-sm">We care about our users, partners, and each other.</p>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-secondary mb-6">Open Positions</h2>
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-secondary mb-2">No open positions right now</h3>
              <p className="text-muted mb-6">
                We&apos;re not actively hiring at the moment, but we&apos;re always interested in meeting talented people.
              </p>
              <p className="text-muted">
                Send us your resume at{' '}
                <a href="mailto:careers@corbez.com" className="text-primary hover:text-primary-dark font-medium">
                  careers@corbez.com
                </a>
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-secondary text-white rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Why Work With Us</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Competitive salary & equity',
                'Remote-first culture',
                'Unlimited PTO',
                'Health, dental & vision',
                'Learning & development budget',
                'Free lunch at partner restaurants',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <p className="text-muted mb-4">Have questions about working at corbez?</p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold"
            >
              Get in touch
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
