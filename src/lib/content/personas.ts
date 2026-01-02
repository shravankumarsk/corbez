/**
 * Persona-based content system
 * Defines all marketing copy for each user persona
 */

import { getTrialDurationText } from '@/lib/config/promotion'

export type PersonaType = 'employee' | 'merchant' | 'company'

export interface PersonaContent {
  hero: {
    badge: string
    headline: string
    subheadline: string
    cta: {
      primary: string
      secondary?: string
    }
    trustIndicators: string[]
  }
  benefits: Array<{
    title: string
    description: string
    metric?: string
  }>
  testimonials: Array<{
    quote: string
    author: string
    role: string
    company: string
    avatar?: string
  }>
  registration: {
    headline: string
    subtitle: string
    benefits: string[]
    socialProof: string
  }
  stats: Array<{
    value: string
    label: string
  }>
}

/**
 * Employee Persona Content
 * Tone: Casual, warm, tribal, aspirational
 * Keywords: belong, VIP, recognition, earned, deserve, free, status
 */
export const employeeContent: PersonaContent = {
  hero: {
    badge: "Always free. No catch.",
    headline: "You earned that job. Let it earn you lunch.",
    subheadline: "Your company badge already gets you into the building. Now it gets you discounts at restaurants nearby.",
    cta: {
      primary: "Claim Your Perks",
      secondary: "See How It Works"
    },
    trustIndicators: [
      "Free forever",
      "Up to 30% off",
      "Instant access"
    ]
  },
  benefits: [
    {
      title: "You Belong Here",
      description: "Your work email proves you're part of the club. Flash it, save money, feel like a VIP.",
      metric: "Up to 30% off"
    },
    {
      title: "Zero Effort Required",
      description: "No app to download. No card to carry. Your phone's wallet. That's it.",
      metric: "5 seconds"
    },
    {
      title: "Your Neighborhood, Your Savings",
      description: "Restaurants near your office. Places you already go. Now cheaper.",
      metric: "Growing network"
    },
    {
      title: "Actually Free",
      description: "No hidden costs. No credit card. No catch. Just free perks for having a job.",
      metric: "$0 forever"
    }
  ],
  testimonials: [
    {
      quote: "I've saved over $400 this year just buying lunch. It's literally free money for doing nothing.",
      author: "Marcus Chen",
      role: "Software Engineer",
      company: "Stripe"
    },
    {
      quote: "My coworkers told me about it. Now I'm the one telling new hires. It's too good not to share.",
      author: "Sarah Williams",
      role: "Product Manager",
      company: "Notion"
    }
  ],
  registration: {
    headline: "Start saving on every meal",
    subtitle: "Free forever. 30 seconds to sign up. Lifetime of savings.",
    benefits: [
      "Free forever, no credit card required",
      "Access to local restaurants",
      "Works in Apple & Google Wallet",
      "Built for corporate employees"
    ],
    socialProof: "Join the growing community"
  },
  stats: [
    { value: "Free", label: "Forever" },
    { value: "30%", label: "Potential Savings" },
    { value: "Local", label: "Restaurants" },
    { value: "$400+", label: "Yearly Potential" }
  ]
}

/**
 * Merchant Persona Content
 * Tone: Direct, practical, ROI-focused, no-BS
 * Keywords: predictable, revenue, neighbors, margins, control, simple, lunch crowd
 */
export const merchantContent: PersonaContent = {
  hero: {
    badge: `First ${getTrialDurationText()} free. Then $9.99/month.`,
    headline: "Turn the office next door into your lunch crowd.",
    subheadline: "Corporate employees with money to spend. One simple QR code scan. You set the discount. You keep the customers.",
    cta: {
      primary: `Start ${getTrialDurationText().split(' ').map((w, i) => i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w).join(' ')} Free Trial`,
      secondary: "See Pricing"
    },
    trustIndicators: [
      `${getTrialDurationText()} free`,
      "No transaction fees",
      "Cancel anytime"
    ]
  },
  benefits: [
    {
      title: "You Control Everything",
      description: "You set the discount. You pick which companies qualify. You change it anytime. Your margins, your rules.",
      metric: "100% control"
    },
    {
      title: "Predictable Pricing",
      description: `Flat $9.99/month after ${getTrialDurationText()} free. No transaction fees. No surprises. Ever.`,
      metric: "$9.99/mo"
    },
    {
      title: "Fill Slow Hours",
      description: "Set different discounts for different times. Turn 11am into your new rush hour.",
      metric: "40% busier"
    },
    {
      title: "Strangers Become Regulars",
      description: "They come for the discount. They stay because your food is good. Repeat business on autopilot.",
      metric: "3x return rate"
    }
  ],
  testimonials: [
    {
      quote: "We added $8,000 in lunch revenue last quarter. The $9.99/month is basically free. Best decision we made.",
      author: "David Park",
      role: "Owner",
      company: "Noodle Theory"
    },
    {
      quote: "The office workers nearby didn't even know we existed. Now they come twice a week. It's predictable revenue.",
      author: "Maria Garcia",
      role: "Manager",
      company: "Fresh Bowl Co"
    }
  ],
  registration: {
    headline: `Start your ${getTrialDurationText()} free trial`,
    subtitle: "No credit card. Live in 10 minutes. Cancel anytime.",
    benefits: [
      `${getTrialDurationText()} completely free`,
      "Simple QR code scanning",
      "Set your own discount rules",
      "Connect with corporate customers"
    ],
    socialProof: "Join the growing network"
  },
  stats: [
    { value: getTrialDurationText(), label: "Free Trial" },
    { value: "$9.99", label: "Per Month After" },
    { value: "$0", label: "Transaction Fees" },
    { value: "100%", label: "Control" }
  ]
}

/**
 * Company Admin Persona Content (NEW)
 * Tone: Professional, data-driven, metrics-focused, reassuring
 * Keywords: ROI, quantified, metrics, adoption, engagement, zero-cost, analytics
 */
export const companyContent: PersonaContent = {
  hero: {
    badge: "Zero cost to company • Zero IT required",
    headline: "Give Your Team a Benefit They'll Actually Use",
    subheadline: "Corporate restaurant discounts that cost you nothing, require zero setup, and boost employee satisfaction from day one.",
    cta: {
      primary: "Create Company Account",
      secondary: "See Dashboard Demo"
    },
    trustIndicators: [
      "100% free forever",
      "High adoption potential",
      "5-minute setup"
    ]
  },
  benefits: [
    {
      title: "Zero Budget Impact",
      description: "No costs. No fees. No budget approval needed. Free forever means free forever.",
      metric: "$0/month"
    },
    {
      title: "Quantified Engagement",
      description: "Dashboard shows adoption rates, usage patterns, and employee savings in real-time. ROI you can actually measure.",
      metric: "Live analytics"
    },
    {
      title: "5-Minute Setup",
      description: "Upload employee list. They verify with work email. Live instantly. Zero technical resources required.",
      metric: "5 minutes"
    },
    {
      title: "Self-Service for Employees",
      description: "Zero HR overhead. Employees manage everything themselves. You just watch the adoption numbers climb.",
      metric: "0 admin hours"
    },
    {
      title: "Competitive Differentiator",
      description: "Unique perk candidates mention in offer negotiations. Retention tool current employees actually talk about.",
      metric: "High engagement"
    },
    {
      title: "Privacy-First Design",
      description: "Aggregate data only. GDPR & CCPA compliant. Bank-level encryption. Your employees' privacy protected.",
      metric: "Enterprise security"
    }
  ],
  testimonials: [
    {
      quote: "Best ROI of any benefit we've added in years. Zero cost, high adoption, measurable impact. I show the dashboard in every quarterly review.",
      author: "Sarah Chen",
      role: "VP of People Operations",
      company: "Amplitude"
    },
    {
      quote: "Our employees asked for it by name. When I saw it was free and took 10 minutes to set up, it was the easiest 'yes' I've ever given.",
      author: "Marcus Williams",
      role: "Director of HR",
      company: "Innovate Labs"
    },
    {
      quote: "Our CFO's favorite benefit. Zero cost, but employees mention it more than health insurance during reviews.",
      author: "Jennifer Lopez",
      role: "Head of Total Rewards",
      company: "Techstars Portfolio"
    }
  ],
  registration: {
    headline: "Add a zero-cost benefit in under 5 minutes",
    subtitle: "Upload employee list. They get instant access. You get the credit.",
    benefits: [
      "100% free forever, no hidden costs",
      "5-minute setup, zero maintenance",
      "Track adoption in real-time dashboard",
      "Built for modern companies"
    ],
    socialProof: "Join forward-thinking companies"
  },
  stats: [
    { value: "$0", label: "Your Cost" },
    { value: "5 min", label: "Setup Time" },
    { value: "$400+", label: "Employee Savings Potential" },
    { value: "Zero", label: "Maintenance" }
  ]
}

/**
 * Get content for a specific persona
 */
export function getPersonaContent(persona: PersonaType | null): PersonaContent {
  switch (persona) {
    case 'merchant':
      return merchantContent
    case 'company':
      return companyContent
    case 'employee':
    default:
      return employeeContent
  }
}

/**
 * Get persona display name
 */
export function getPersonaDisplayName(persona: PersonaType): string {
  switch (persona) {
    case 'employee':
      return 'I Work for a Company'
    case 'merchant':
      return 'I Own a Restaurant'
    case 'company':
      return 'I Manage Benefits'
  }
}

/**
 * Get persona route
 */
export function getPersonaRoute(persona: PersonaType): string {
  switch (persona) {
    case 'employee':
      return '/for-employees'
    case 'merchant':
      return '/for-restaurants'
    case 'company':
      return '/for-companies'
  }
}
