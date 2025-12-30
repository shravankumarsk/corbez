import type { Metadata } from 'next'
import SessionProvider from '@/components/providers/SessionProvider'
import CookieConsent from '@/components/common/CookieConsent'
import './globals.css'

export const metadata: Metadata = {
  title: 'corbez - Corporate Benefits',
  description: 'Your company badge just became your favorite restaurant\'s VIP pass. Corporate discounts made simple.',
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
