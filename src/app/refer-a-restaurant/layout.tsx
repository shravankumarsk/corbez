import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refer a Restaurant - Earn Up to 3 Months Free',
  description: 'Know a restaurant that should join Corbez? Refer them and earn up to 3 months free when they sign up. They get 9 months free to try our corporate dining platform risk-free.',
  keywords: [
    'refer restaurant',
    'restaurant referral program',
    'earn free months',
    'corbez referral',
    'restaurant partnership',
    'merchant rewards',
    'restaurant benefits',
  ],
  openGraph: {
    title: 'Refer a Restaurant - Corbez Rewards',
    description: 'Refer a restaurant to Corbez and you both win. You earn up to 3 months free, they get 9 months free trial.',
    url: 'https://corbez.com/refer-a-restaurant',
    type: 'website',
  },
  alternates: {
    canonical: 'https://corbez.com/refer-a-restaurant',
  },
}

export default function ReferRestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
