import { Navbar, Footer } from '@/components/landing'
import Link from 'next/link'

const steps = [
  {
    step: 1,
    title: 'Say You\'re In',
    description: 'Quick signup. No credit card. 6 months free. You\'re live before lunch.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    step: 2,
    title: 'Set Your Rules',
    description: '10% for everyone? 15% for Google? You decide. Change it whenever.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    step: 3,
    title: 'Watch Them Walk In',
    description: 'Scan their code. See their name. Apply the discount. Build the relationship.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
]

const benefits = [
  {
    title: 'They\'re Already Nearby',
    description: 'The office building next door is full of hungry people with disposable income. Give them a reason to pick you.',
  },
  {
    title: 'Regulars, Not Randos',
    description: 'Corporate employees come back. Week after week. They bring colleagues. They leave reviews.',
  },
  {
    title: 'No Tech Headaches',
    description: 'If your staff can take a photo, they can scan a code. That\'s the whole training.',
  },
  {
    title: 'Your Margins, Your Call',
    description: 'Give tech companies 15%. Give everyone else 10%. Run a 20% promo for slow days. You\'re in control.',
  },
  {
    title: 'Know Who\'s Coming',
    description: 'See which companies love you. Which days are busiest. What\'s working.',
  },
  {
    title: 'One Flat Price',
    description: '$9.99/month after 6 months free. No per-scan fees. No percentage of sales. No surprises.',
  },
]

export default function ForRestaurantsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              6 months free. Always.
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              Turn the office next door into{' '}
              <span className="text-primary">your lunch crowd</span>
            </h1>
            <p className="text-xl text-muted mb-8">
              They walk by every day. They&apos;re hungry. They have money.
              <br className="hidden sm:block" />
              Give them a reason to choose you.
            </p>
            <Link
              href="/register?type=merchant"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              Start Free Trial
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-sm text-muted mt-4">No credit card required</p>
          </div>
        </div>
      </section>

      {/* The Problem */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
              You know the problem
            </h2>
            <p className="text-xl text-muted">
              Delivery apps take 30%. Marketing costs a fortune. And those office workers?
              They keep going to the same boring chain because they don&apos;t know you exist.
              <br className="hidden sm:block" /><br className="hidden sm:block" />
              <strong className="text-secondary">What if they had a reason to discover you?</strong>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary text-center mb-4">
            Three steps to your new regulars
          </h2>
          <p className="text-lg text-muted text-center mb-12 max-w-2xl mx-auto">
            Simpler than your POS system.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="relative bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 left-8 bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 text-secondary">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold text-secondary mb-3">
                  {step.title}
                </h3>
                <p className="text-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary text-center mb-4">
            What&apos;s in it for you
          </h2>
          <p className="text-lg text-muted text-center mb-12 max-w-2xl mx-auto">
            Beyond new customers (which is the point), here&apos;s everything else.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:border-secondary/20 transition-colors">
                <h3 className="text-xl font-semibold text-secondary mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-secondary mb-6">
              &ldquo;Best marketing we never paid for&rdquo;
            </h2>
            <p className="text-xl text-muted mb-4">
              We used to see the same 20 faces every day. Now we&apos;ve got people coming in who say
              &ldquo;I heard you&apos;re part of the corbez thing.&rdquo;
            </p>
            <p className="text-secondary font-medium">
              — Maria, Owner of Café Loma
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-secondary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            The math is simple
          </h2>
          <p className="text-lg text-white/70 mb-8">
            Less than a fancy coffee per day. Pay for itself with one new regular.
          </p>
          <div className="bg-white rounded-2xl p-8">
            <div className="text-5xl font-bold text-secondary mb-2">$9.99</div>
            <div className="text-muted mb-4">per month, per location</div>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Unlimited scans and verifications</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Set your own discount rules</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>See who&apos;s visiting and when</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Human support when you need it</span>
              </li>
            </ul>
            <Link
              href="/register?type=merchant"
              className="block w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-semibold transition-all hover:shadow-lg"
            >
              Start Your Free Month
            </Link>
            <p className="text-sm text-muted mt-4">No credit card. Cancel anytime. No questions.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
