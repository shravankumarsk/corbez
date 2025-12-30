import Link from 'next/link'
import ScrollReveal from './ScrollReveal'

const included = [
  'Unlimited employee verifications',
  'Custom discount rules',
  'Works on any phone',
  'Real-time scanning',
  'See who visited when',
  'Human support when you need it',
]

export default function Pricing() {
  return (
    <section className="py-20 bg-gray-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              One price. No surprises.
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Employees use corbez free. Always. Restaurants pay less than a fancy coffee per day.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow">
              {/* Header */}
              <div className="bg-secondary p-8 text-center">
                <p className="text-white/70 text-sm mb-2">For restaurants</p>
                <div className="text-white">
                  <span className="text-5xl font-bold">$9.99</span>
                  <span className="text-white/70">/month</span>
                </div>
                <p className="text-white/70 mt-2">per location</p>
              </div>

              {/* Trial Banner */}
              <div className="bg-accent/10 border-b border-accent/20 px-8 py-4 text-center">
                <p className="text-secondary font-semibold">
                  6 months free. See if we&apos;re right for each other.
                </p>
                <p className="text-sm text-muted">
                  No credit card. No commitment. No catch.
                </p>
              </div>

              {/* What's Included */}
              <div className="p-8">
                <p className="text-sm font-medium text-secondary mb-4">Everything you need:</p>
                <ul className="space-y-4">
                  {included.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register?type=merchant"
                  className="mt-8 w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-semibold text-center transition-colors block"
                >
                  Start 6 Months Free
                </Link>

                <p className="text-center text-sm text-muted mt-4">
                  Leave anytime. We don&apos;t do contracts.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* For Employees */}
        <ScrollReveal delay={400}>
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-4 bg-white rounded-xl px-6 py-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-secondary">Employees? Always free.</p>
                <p className="text-sm text-muted">Your company already pays you. We won&apos;t.</p>
              </div>
              <Link
                href="/register?type=employee"
                className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Join Free
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
