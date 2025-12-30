import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant } from '@/lib/db/models/merchant.model'
import DashboardLayout from '@/components/layout/DashboardLayout'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard/merchant',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    label: 'Scanner',
    href: '/dashboard/merchant/scanner',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
        />
      </svg>
    ),
  },
  {
    label: 'Discounts',
    href: '/dashboard/merchant/discounts',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/dashboard/merchant/settings',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
]

export default async function MerchantDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Check if merchant needs onboarding
  await connectDB()
  const merchant = await Merchant.findOne({ userId: session.user.id })

  if (merchant && !merchant.onboardingCompleted) {
    // Get current pathname to allow access to onboarding page
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || ''

    // Allow access to onboarding page, redirect everything else
    if (!pathname.includes('/onboarding')) {
      redirect('/dashboard/merchant/onboarding')
    }

    // For onboarding page, render without the dashboard layout
    return <>{children}</>
  }

  const userName = session.user.firstName
    ? `${session.user.firstName} ${session.user.lastName || ''}`.trim()
    : undefined

  return (
    <DashboardLayout
      navItems={navItems}
      userRole={session.user.role || 'MERCHANT'}
      userEmail={session.user.email || ''}
      userName={userName}
      profileImage={session.user.profileImage}
    >
      {children}
    </DashboardLayout>
  )
}
