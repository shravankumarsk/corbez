import { Navbar, Footer, Pricing } from '@/components/landing'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - Start Free for 6 Months',
  description: 'Restaurant pricing starts at $9.99/month after a 6-month free trial. No setup fees, no per-transaction charges. Cancel anytime. Free forever for employees.',
  keywords: [
    'restaurant pricing',
    'corporate discount pricing',
    'employee benefits pricing',
    'free trial',
    'restaurant subscription',
    'no transaction fees',
  ],
  openGraph: {
    title: 'Corbez Pricing - Free 6-Month Trial for Restaurants',
    description: 'Only $9.99/month for restaurants. Unlimited employee verifications, no transaction fees. Free for employees forever.',
    url: 'https://corbez.com/pricing',
    type: 'website',
  },
  alternates: {
    canonical: 'https://corbez.com/pricing',
  },
}

const faqs = [
  {
    question: 'Is there really a free trial?',
    answer: 'Yes! Restaurants get 6 months completely free with no credit card required. You can cancel anytime.',
  },
  {
    question: 'Are there any per-transaction fees?',
    answer: 'No. The $9.99/month covers unlimited employee verifications. There are no hidden fees or per-scan charges.',
  },
  {
    question: 'Is it free for employees?',
    answer: 'Yes, always. Employees never pay anything to use corbez. Just verify your corporate email and start saving.',
  },
  {
    question: 'Can I set different discounts for different companies?',
    answer: 'Absolutely. You can set a base discount for all verified employees, then create custom tiers for specific companies or spending thresholds.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards through Stripe. You can update your payment method anytime from your dashboard.',
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes. There are no long-term contracts. Cancel from your dashboard whenever you want, and your access continues until the end of your billing period.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-8 md:pt-32 md:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted">
              One flat rate for restaurants. Always free for employees.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Component */}
      <Pricing />

      {/* FAQs */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="border-b border-gray-100 pb-6">
                <h3 className="text-lg font-semibold text-secondary mb-2">
                  {faq.question}
                </h3>
                <p className="text-muted">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start your free trial today
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join hundreds of restaurants already using corbez to attract corporate customers.
          </p>
          <Link
            href="/register?type=merchant"
            className="inline-block bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
