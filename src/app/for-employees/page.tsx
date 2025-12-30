import { Navbar, Footer } from '@/components/landing'
import Link from 'next/link'

const steps = [
  {
    step: 1,
    title: 'Prove You\'re Legit',
    description: 'Your work email is your golden ticket. Click one link and you\'re verified for good.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: 'Pocket Your Pass',
    description: 'Your digital card lands right in your wallet app. No app to download. No card to lose.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: 'Walk In Like a Regular',
    description: 'Flash your code. They know who you are. Enjoy the discount and the recognition.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const benefits = [
  {
    title: 'Feel Like a VIP',
    description: 'Walk into restaurants and be recognized. No explanations needed. You belong here.',
  },
  {
    title: 'Your Phone, Your Pass',
    description: 'Lives in Apple Wallet or Google Wallet. Works even when you have no signal.',
  },
  {
    title: 'New Spots, Same Status',
    description: 'More restaurants join every week. Your status travels with you.',
  },
  {
    title: 'Skip the Awkward',
    description: 'No fumbling for cards. No "I work at..." speeches. Just scan and save.',
  },
]

export default function ForEmployeesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              Always free. No catch.
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              You earned that job.{' '}
              <span className="text-primary">Let it earn you lunch.</span>
            </h1>
            <p className="text-xl text-muted mb-8">
              Your company badge already gets you into the building.
              <br className="hidden sm:block" />
              Now it gets you discounts at restaurants nearby.
            </p>
            <Link
              href="/register?type=employee"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              Claim Your Perks
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* The Feeling */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
              Remember that feeling?
            </h2>
            <p className="text-xl text-muted">
              Walking into your favorite spot and they just <em>know</em> you.
              That nod of recognition. That little something extra.
              <br className="hidden sm:block" />
              <strong className="text-secondary">That&apos;s what corbez gives you. Everywhere.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary text-center mb-4">
            Three steps. That&apos;s it.
          </h2>
          <p className="text-lg text-muted text-center mb-12 max-w-2xl mx-auto">
            Shorter than your coffee order.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="relative bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="absolute -top-4 left-8 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
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
            What you actually get
          </h2>
          <p className="text-lg text-muted text-center mb-12 max-w-2xl mx-auto">
            Beyond the discounts (which are nice), here&apos;s the real value.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-gray-50 rounded-xl p-8 border border-gray-100 hover:border-primary/20 transition-colors">
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
              &ldquo;It&apos;s become a thing in our office&rdquo;
            </h2>
            <p className="text-xl text-muted mb-4">
              &ldquo;Did you get your corbez yet?&rdquo; Like you&apos;re not really one of us until you do.
            </p>
            <p className="text-secondary font-medium">
              — James, Software Engineer at Stripe
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your coworkers are already in.
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            The signup takes 30 seconds. The savings last forever.
            <br className="hidden sm:block" />
            What are you waiting for?
          </p>
          <Link
            href="/register?type=employee"
            className="inline-block bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Join Them
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
