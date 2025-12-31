import type { Metadata } from 'next'
import SessionProvider from '@/components/providers/SessionProvider'
import CookieConsent from '@/components/common/CookieConsent'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://corbez.com'),
  title: {
    default: 'Corbez - Corporate Restaurant Discounts & Employee Benefits',
    template: '%s | Corbez',
  },
  description: 'Transform your employee badge into exclusive restaurant discounts. Corbez connects corporate employees with local restaurants offering up to 30% off. No coupons to print, no apps to download - just show your QR code.',
  keywords: [
    'corporate discounts',
    'employee benefits',
    'restaurant discounts',
    'corporate perks',
    'employee discounts',
    'lunch benefits',
    'corporate dining',
    'QR code discounts',
    'local restaurant deals',
    'employee wellness',
    'corporate benefits platform',
    'B2B benefits',
    'employee engagement',
    'workplace perks',
  ],
  authors: [{ name: 'Corbez' }],
  creator: 'Corbez',
  publisher: 'Corbez',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://corbez.com',
    siteName: 'Corbez',
    title: 'Corbez - Corporate Restaurant Discounts & Employee Benefits',
    description: 'Transform your employee badge into exclusive restaurant discounts. Up to 30% off at local restaurants with just your QR code.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Corbez - Corporate Benefits Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corbez - Corporate Restaurant Discounts',
    description: 'Transform your employee badge into exclusive restaurant discounts. Up to 30% off at local restaurants.',
    images: ['/og-image.png'],
    creator: '@corbez',
  },
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/favicon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://corbez.com',
  },
  verification: {
    google: 'your-google-verification-code',
    // Add actual verification codes when available
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#F45D48" />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <SessionProvider>{children}</SessionProvider>
        <CookieConsent />
      </body>
    </html>
  )
}
