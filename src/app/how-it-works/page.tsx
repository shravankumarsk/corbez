import { Navbar, Footer } from '@/components/landing'
import Link from 'next/link'

const employeeSteps = [
  {
    step: 1,
    title: 'Prove You\'re One of Us',
    description: 'Your work email is your golden ticket. Sign up with it, or use an invite code your company gave you.',
    details: [
      'Use your work email (the one that makes you official)',
      'Or enter an invite code from your company',
      'Click one link. You\'re verified.',
    ],
  },
  {
    step: 2,
    title: 'Get Your Pass',
    description: 'A digital card lands in your wallet app. No plastic. No paper. Just you and your phone.',
    details: [
      'Works with Apple Wallet on iPhone',
      'Works with Google Wallet on Android',
      'Works even when your signal doesn\'t',
    ],
  },
  {
    step: 3,
    title: 'Walk In Like You Own the Place',
    description: 'Show your code. They scan it. They know exactly who you are and what you get.',
    details: [
      'Open your wallet',
      'Let them scan the QR code',
      'Watch the discount appear like magic',
    ],
  },
  {
    step: 4,
    title: 'Enjoy Being a Regular',
    description: 'No awkward explanations. No fumbling with cards. Just the feeling of belonging somewhere.',
    details: [
      'Come back as often as you want',
      'Savings every single time',
      'Maybe they\'ll start remembering your order',
    ],
  },
]

const restaurantSteps = [
  {
    step: 1,
    title: 'Say You\'re In',
    description: 'Tell us about your restaurant. We\'ll give you a month free to see if this is for you.',
    details: [
      'Quick signup with your business info',
      'No credit card to start',
      'You\'re live in minutes, not weeks',
    ],
  },
  {
    step: 2,
    title: 'Make Your Own Rules',
    description: 'Decide who gets what. Give everyone 10%, or make Google employees feel extra special at 15%.',
    details: [
      'Set a default discount for all verified employees',
      'Create VIP rates for specific companies',
      'Change your mind anytime',
    ],
  },
  {
    step: 3,
    title: 'Teach Your Team (It Takes 2 Minutes)',
    description: 'If they can take a phone photo, they can scan a QR code. That\'s the whole training.',
    details: [
      'Works on any phone with a camera',
      'No app to install',
      'The screen tells you exactly what to do',
    ],
  },
  {
    step: 4,
    title: 'Watch Strangers Become Regulars',
    description: 'They came for the discount. They\'ll stay for the food. That\'s how tribes are built.',
    details: [
      'Scan shows you their name and company',
      'Apply their discount',
      'Start building a relationship',
    ],
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-20 bg-gradient-to-b from-background to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              It&apos;s Not Complicated
            </h1>
            <p className="text-xl text-muted">
              We spent months making this simple so you could spend seconds using it.
            </p>
          </div>
        </div>
      </section>

      {/* For Employees */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              For the People Who Make Things Happen
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              From zero to saving in four steps
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Your lunch break is short enough. This won&apos;t take long.
            </p>
          </div>

          <div className="space-y-12">
            {employeeSteps.map((step, index) => (
              <div
                key={step.step}
                className={`flex flex-col md:flex-row gap-8 items-start ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-xl">
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-bold text-secondary">{step.title}</h3>
                  </div>
                  <p className="text-lg text-muted mb-6">{step.description}</p>
                  <ul className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl p-8 md:p-12 flex items-center justify-center min-h-[200px]">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-primary/20">{step.step}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gray-200" />

      {/* For Restaurants */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-4">
              For the Places Worth Going To
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Open to your first verified customer in four steps
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Less time than your espresso machine takes to warm up.
            </p>
          </div>

          <div className="space-y-12">
            {restaurantSteps.map((step, index) => (
              <div
                key={step.step}
                className={`flex flex-col md:flex-row gap-8 items-start ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center font-bold text-xl">
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-bold text-secondary">{step.title}</h3>
                  </div>
                  <p className="text-lg text-muted mb-6">{step.description}</p>
                  <ul className="space-y-3">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 bg-gradient-to-br from-secondary/5 to-accent/5 rounded-2xl p-8 md:p-12 flex items-center justify-center min-h-[200px]">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-secondary/20">{step.step}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Still reading? Just try it.
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            The signup takes less time than this page did to scroll through.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Get Started Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
