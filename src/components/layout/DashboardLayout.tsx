'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  userRole: string
  userEmail: string
  userName?: string
  profileImage?: string
}

export default function DashboardLayout({ children, navItems, userRole, userEmail, userName, profileImage }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const displayName = userName || userEmail.split('@')[0]
  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userEmail.charAt(0).toUpperCase()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - always fixed */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
            <Link href="/" className="text-xl font-bold text-primary">
              Corbe
            </Link>
            <button className="lg:hidden p-2 text-gray-500" onClick={() => setSidebarOpen(false)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${isActive ? 'bg-primary/10 text-primary' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <span className="w-5 h-5 mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User section - at bottom */}
          <div className="p-3 border-t border-gray-200 mt-auto">
            <div className="flex items-center p-2 rounded-lg bg-gray-50">
              {profileImage ? (
                <Image
                  src={profileImage}
                  alt={displayName}
                  width={36}
                  height={36}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium text-sm">
                    {initials}
                  </span>
                </div>
              )}
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center justify-center px-3 py-2 mt-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content - offset by sidebar width */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-14 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <button
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-sm font-medium text-gray-900">
              {getGreeting()}, {userName?.split(' ')[0] || 'there'}!
            </h1>
          </div>
          {profileImage ? (
            <Image
              src={profileImage}
              alt={displayName}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium text-sm">
                {initials}
              </span>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
