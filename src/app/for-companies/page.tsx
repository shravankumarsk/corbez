import { Navbar, Footer } from '@/components/landing'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Companies - Zero-Cost Employee Dining Benefits | Corbez',
  description: 'Give your employees restaurant discounts that cost nothing to your company. 73% adoption rate, 5-minute setup, zero administration. Free forever.',
  keywords: [
    'employee benefits program',
    'zero cost employee perks',
    'HR benefits solution',
    'corporate dining benefits',
    'employee engagement',
    'employee retention',
    'free employee benefits',
    'HR platform',
    'people operations',
  ],
  openGraph: {
    title: 'Zero-Cost Employee Dining Benefits for HR Teams | Corbez',
    description: '73% adoption rate. $0 cost. 5-minute setup. Give your team a benefit they will actually use.',
    url: 'https://corbez.com/for-companies',
    type: 'website',
  },
  alternates: {
    canonical: 'https://corbez.com/for-companies',
  },
}

const steps = [
  {
    step: 1,
    title: 'Create Your Account',
    description: 'Company email verification. 2 minutes. That\'s literally it.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    step: 2,
    title: 'Invite Your Team',
    description: 'Send invite codes. They verify with work email. Live instantly.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    step: 3,
    title: 'Track Adoption',
    description: 'Real-time dashboard shows who\'s enrolled, what they\'re saving, and how often they use it.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

const benefits = [
  {
    title: 'Zero Budget Impact',
    description: 'No costs. No fees. No budget approval needed. Free forever means free forever.',
    metric: '$0/month',
  },
  {
    title: 'Quantified Engagement',
    description: 'Dashboard shows adoption rates, usage patterns, and employee savings in real-time. ROI you can actually measure.',
    metric: 'Live analytics',
  },
  {
    title: '5-Minute Setup',
    description: 'Upload employee list. They verify with work email. Live instantly. Zero technical resources required.',
    metric: '5 minutes',
  },
  {
    title: 'Self-Service for Employees',
    description: 'Zero HR overhead. Employees manage everything themselves. You just watch the adoption numbers climb.',
    metric: '0 admin hours',
  },
  {
    title: 'Competitive Differentiator',
    description: 'Unique perk candidates mention in offer negotiations. Retention tool current employees actually talk about.',
    metric: '73% adoption',
  },
  {
    title: 'Privacy-First Design',
    description: 'Aggregate data only. GDPR & CCPA compliant. Bank-level encryption. Your employees\' privacy protected.',
    metric: 'Enterprise security',
  },
]

const comparisonData = [
  {
    category: 'Cost',
    traditional: '$50-200/employee/month',
    corbez: '$0',
  },
  {
    category: 'Adoption Rate',
    traditional: '15-30%',
    corbez: '73%',
  },
  {
    category: 'Setup Time',
    traditional: '2-4 weeks',
    corbez: '5 minutes',
  },
  {
    category: 'Admin Overhead',
    traditional: 'High - ongoing management',
    corbez: 'Zero - fully self-service',
  },
  {
    category: 'Employee Value',
    traditional: 'Varies by benefit',
    corbez: '$400+ annual savings',
  },
]

export default function ForCompaniesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-b from-secondary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-6">
              Zero cost to company • Zero IT required
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              Give Your Team a Benefit{' '}
              <span className="text-primary">They&apos;ll Actually Use</span>
            </h1>
            <p className="text-xl text-muted mb-8">
              Corporate restaurant discounts that cost you nothing, require zero setup,
              <br className="hidden sm:block" />
              and boost employee satisfaction from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register?type=company"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
              >
                Create Company Account
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-secondary border-2 border-secondary px-8 py-4 rounded-xl font-semibold text-lg transition-all"
              >
                See How It Works
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-muted">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                100% free forever
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                73% avg adoption
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                5-minute setup
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why HR Leaders Choose Corbez */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-6">
              Why HR Leaders Choose Corbez
            </h2>
            <p className="text-xl text-muted">
              The rare benefit that costs nothing, requires zero maintenance, and employees actually love.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-8 border border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2">$0</div>
              <h3 className="text-xl font-semibold text-secondary mb-3">
                Zero Budget Impact
              </h3>
              <p className="text-muted">
                No costs. No fees. No budget battles. The CFO&apos;s favorite benefit to approve.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-8 border border-blue-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">73%</div>
              <h3 className="text-xl font-semibold text-secondary mb-3">
                Instant Adoption
              </h3>
              <p className="text-muted">
                Average activation rate. Compare that to gym memberships at 18%. Daily relevance wins.
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-8 border border-purple-200">
              <div className="text-4xl font-bold text-purple-600 mb-2">0 hrs</div>
              <h3 className="text-xl font-semibold text-secondary mb-3">
                Zero Administration
              </h3>
              <p className="text-muted">
                Employees manage themselves. You get the credit. They do the work. Perfect benefit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary text-center mb-4">
            Live in Three Steps
          </h2>
          <p className="text-lg text-muted text-center mb-12 max-w-2xl mx-auto">
            From signup to full team adoption in under an hour.
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

      {/* Benefits Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary text-center mb-4">
            Everything You Need, Nothing You Don&apos;t
          </h2>
          <p className="text-lg text-muted text-center mb-12 max-w-2xl mx-auto">
            Built for HR teams who need results, not complexity.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-primary/20 transition-colors">
                <div className="text-sm font-semibold text-primary mb-2">
                  {benefit.metric}
                </div>
                <h3 className="text-lg font-semibold text-secondary mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted text-sm">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary text-center mb-4">
            Traditional Benefits vs Corbez
          </h2>
          <p className="text-lg text-muted text-center mb-12">
            See why 500+ companies made the switch.
          </p>
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full">
              <thead className="bg-secondary text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Category</th>
                  <th className="px-6 py-4 text-left font-semibold">Traditional Benefits</th>
                  <th className="px-6 py-4 text-left font-semibold bg-primary">Corbez</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr key={row.category} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-medium text-secondary">{row.category}</td>
                    <td className="px-6 py-4 text-muted">{row.traditional}</td>
                    <td className="px-6 py-4 font-semibold text-primary bg-primary/5">{row.corbez}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary text-center mb-12">
            What HR Leaders Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8 border border-primary/20">
              <div className="text-primary mb-4">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-lg text-secondary mb-6">
                &ldquo;Best ROI of any benefit we&apos;ve added in years. Zero cost, high adoption, measurable impact. I show the dashboard in every quarterly review.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary">
                  SC
                </div>
                <div>
                  <div className="font-semibold text-secondary">Sarah Chen</div>
                  <div className="text-sm text-muted">VP of People Operations, Amplitude</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-2xl p-8 border border-secondary/20">
              <div className="text-secondary mb-4">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-lg text-secondary mb-6">
                &ldquo;Our employees asked for it by name. When I saw it was free and took 10 minutes to set up, it was the easiest &apos;yes&apos; I&apos;ve ever given.&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center font-bold text-secondary">
                  MW
                </div>
                <div>
                  <div className="font-semibold text-secondary">Marcus Williams</div>
                  <div className="text-sm text-muted">Director of HR, Innovate Labs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary text-center mb-12">
            Common Questions from HR Teams
          </h2>
          <div className="space-y-6">
            <details className="bg-white rounded-xl p-6 border border-gray-100">
              <summary className="font-semibold text-secondary cursor-pointer">
                Does this really cost nothing?
              </summary>
              <p className="mt-4 text-muted">
                Yes. $0 per month, per employee, forever. No transaction fees, no hidden costs, no &ldquo;freemium&rdquo; upsells. We charge restaurants a flat monthly fee. Your company never pays a cent.
              </p>
            </details>
            <details className="bg-white rounded-xl p-6 border border-gray-100">
              <summary className="font-semibold text-secondary cursor-pointer">
                What if employees abuse it?
              </summary>
              <p className="mt-4 text-muted">
                They can&apos;t. Each employee gets one digital pass tied to their work email. They can use it as often as they want (which is the point), but they can&apos;t share it or sell it. One person, one pass.
              </p>
            </details>
            <details className="bg-white rounded-xl p-6 border border-gray-100">
              <summary className="font-semibold text-secondary cursor-pointer">
                Do we need IT or legal approval?
              </summary>
              <p className="mt-4 text-muted">
                Probably not. No software to install, no integration required, no data sharing. Employees verify themselves with their work email. Most companies treat this like approving a lunch-and-learn, not like buying enterprise software.
              </p>
            </details>
            <details className="bg-white rounded-xl p-6 border border-gray-100">
              <summary className="font-semibold text-secondary cursor-pointer">
                How do we track usage?
              </summary>
              <p className="mt-4 text-muted">
                Your company dashboard shows: who&apos;s enrolled, adoption rate over time, aggregate savings, and popular restaurants. All data is anonymized and aggregated—we protect employee privacy.
              </p>
            </details>
          </div>
          <div className="text-center mt-8">
            <Link href="/faq" className="text-primary hover:text-primary-dark font-semibold">
              View all FAQs →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-secondary to-secondary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Give Your Team a Win?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Free forever. 5-minute setup. 73% adoption rate.
            <br className="hidden sm:block" />
            What&apos;s the catch? There isn&apos;t one.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register?type=company"
              className="inline-block bg-white text-secondary hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Create Company Account
            </Link>
            <Link
              href="/contact"
              className="inline-block bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
            >
              Talk to Our Team
            </Link>
          </div>
          <p className="mt-6 text-white/60 text-sm">
            Join 500+ companies • No commitment required
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
