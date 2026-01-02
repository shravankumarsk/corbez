import Link from 'next/link'
import { getTrialDurationText } from '@/lib/config/promotion'

interface BlogCTAProps {
  variant?: 'restaurant' | 'company' | 'employee' | 'generic'
  compact?: boolean
}

export default function BlogCTA({ variant = 'generic', compact = false }: BlogCTAProps) {
  const ctas = {
    restaurant: {
      title: 'Ready to Attract Corporate Customers?',
      description: `Join Corbez free for ${getTrialDurationText()} and start building a loyal base of corporate customers who visit regularly and spend more.`,
      primaryCTA: {
        text: 'Start Free Trial',
        href: '/for-restaurants',
      },
      secondaryCTA: {
        text: 'Learn More',
        href: '/for-restaurants',
      },
      bgColor: 'bg-gradient-to-br from-primary/10 to-orange-50',
    },
    company: {
      title: 'Offer This Benefit to Your Employees',
      description:
        'Give your team access to exclusive discounts at 100+ local restaurants. Zero cost to your company, meaningful value to your employees.',
      primaryCTA: {
        text: 'Get Started Free',
        href: '/for-companies',
      },
      secondaryCTA: {
        text: 'See How It Works',
        href: '/how-it-works',
      },
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
    },
    employee: {
      title: 'Start Saving on Every Meal',
      description:
        'Ask your employer about Corbez corporate dining benefits. Save 12-15% at amazing local restaurants near your office.',
      primaryCTA: {
        text: 'For Employees',
        href: '/for-employees',
      },
      secondaryCTA: {
        text: 'See Restaurants',
        href: '/for-employees#restaurants',
      },
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    },
    generic: {
      title: 'Discover Corbez',
      description:
        'The commission-free platform connecting corporate employees with exclusive restaurant discounts. Free for companies, profitable for restaurants.',
      primaryCTA: {
        text: 'Learn More',
        href: '/how-it-works',
      },
      secondaryCTA: {
        text: 'Get Started',
        href: '/for-restaurants',
      },
      bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
    },
  }

  const cta = ctas[variant]

  if (compact) {
    return (
      <div className={`${cta.bgColor} rounded-xl p-6 border border-gray-200`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg font-bold text-secondary mb-1">{cta.title}</h3>
            <p className="text-sm text-muted">{cta.description}</p>
          </div>
          <Link
            href={cta.primaryCTA.href}
            className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-xl transition-all whitespace-nowrap"
          >
            {cta.primaryCTA.text}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`${cta.bgColor} rounded-2xl p-8 md:p-12 border border-gray-200`}>
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">{cta.title}</h2>
        <p className="text-lg text-muted mb-8 max-w-2xl mx-auto">{cta.description}</p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={cta.primaryCTA.href}
            className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            {cta.primaryCTA.text}
          </Link>
          <Link
            href={cta.secondaryCTA.href}
            className="inline-block bg-white hover:bg-gray-50 text-secondary font-semibold px-8 py-4 rounded-xl transition-all border-2 border-gray-200"
          >
            {cta.secondaryCTA.text}
          </Link>
        </div>
      </div>
    </div>
  )
}
