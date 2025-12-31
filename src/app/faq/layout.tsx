import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ - Frequently Asked Questions',
  description: 'Find answers to common questions about Corbez for employees, restaurants, and companies. Learn how our corporate dining benefits platform works, pricing, discounts, and more.',
  keywords: [
    'corbez faq',
    'frequently asked questions',
    'employee benefits help',
    'restaurant partnership faq',
    'corporate discounts questions',
    'how corbez works',
    'corbez support',
    'restaurant discounts help',
    'employee discount program',
  ],
  openGraph: {
    title: 'FAQ - Corbez Help Center',
    description: 'Get answers to your questions about Corbez corporate dining benefits. Learn about pricing, discounts, verification, and more.',
    url: 'https://corbez.com/faq',
    type: 'website',
  },
  alternates: {
    canonical: 'https://corbez.com/faq',
  },
}

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
