'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Navbar,
  Hero,
  HowItWorks,
  Benefits,
  Stats,
  Testimonials,
  Pricing,
  CTASection,
  Footer,
} from '@/components/landing'
import PersonaGateway from '@/components/landing/PersonaGateway'
import PersonaSwitcher from '@/components/landing/PersonaSwitcher'
import StructuredData, { organizationSchema, websiteSchema } from '@/components/seo/StructuredData'

export default function Home() {
  const { data: session } = useSession()

  // If logged in, show dashboard redirect
  if (session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to corbez</h1>
            <p className="text-gray-600 mt-2">Corporate Benefits Marketplace</p>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Hello, {session.user?.email}</h2>
            <p className="text-gray-600 mb-6">Role: <span className="font-semibold">{session.user?.role}</span></p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {session.user?.role === 'EMPLOYEE' && (
                <Link
                  href="/dashboard/employee"
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold text-center"
                >
                  My Dashboard
                </Link>
              )}

              {session.user?.role === 'MERCHANT' && (
                <Link
                  href="/dashboard/merchant"
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold text-center"
                >
                  Merchant Dashboard
                </Link>
              )}

              {session.user?.role === 'COMPANY_ADMIN' && (
                <Link
                  href="/dashboard/company"
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold text-center"
                >
                  Company Admin Portal
                </Link>
              )}

              {session.user?.role === 'PLATFORM_ADMIN' && (
                <Link
                  href="/super-admin"
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold text-center"
                >
                  Platform Admin
                </Link>
              )}

              <Link
                href="/api/auth/signout"
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold text-center"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Public landing page
  return (
    <>
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
      <div className="min-h-screen bg-background">
        <Navbar />
        <Hero />
        <PersonaGateway />
        <HowItWorks />
        <Benefits />
        <Stats />
        <Testimonials />
        <Pricing />
        <CTASection />
        <Footer />
        <PersonaSwitcher />
      </div>
    </>
  )
}
