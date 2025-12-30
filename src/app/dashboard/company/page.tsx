'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'

interface CompanyData {
  company: {
    _id: string
    name: string
    emailDomain?: string
  }
  admin: {
    role: string
    title?: string
    permissions: {
      manageEmployees: boolean
      manageInvites: boolean
      manageAdmins: boolean
      viewReports: boolean
    }
  }
  stats: {
    employeeCount: number
    pendingCount: number
  }
  inviteStats: {
    total: number
    active: number
    used: number
    expired: number
    revoked: number
    usedLast7Days: number
    usedLast30Days: number
    conversionRate: number
  }
}

interface MerchantSavings {
  _id: string
  businessName: string
  logo?: string
  avgOrderValue: number
  discountPercentage: number
  potentialMonthlySavings: number
  perEmployeeSavings: number
  perVisitSavings: number
}

interface SavingsData {
  employeeCount: number
  merchants: MerchantSavings[]
  totalPotentialMonthlySavings: number
  totalPotentialAnnualSavings: number
}

export default function CompanyDashboard() {
  const [data, setData] = useState<CompanyData | null>(null)
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [savingsLoading, setSavingsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/company/me')
        const result = await response.json()
        if (result.success) {
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch company data:', error)
      } finally {
        setLoading(false)
      }
    }

    const fetchSavings = async () => {
      try {
        const response = await fetch('/api/company/savings')
        const result = await response.json()
        if (result.success) {
          setSavingsData(result)
        }
      } catch (error) {
        console.error('Failed to fetch savings data:', error)
      } finally {
        setSavingsLoading(false)
      }
    }

    fetchData()
    fetchSavings()
  }, [])

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      OWNER: 'bg-purple-100 text-purple-800',
      HR: 'bg-blue-100 text-blue-800',
      CONTACT: 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[role] || styles.CONTACT}`}>
        {role}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card variant="bordered">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You are not a company admin.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">{data.company.name}</h1>
            {getRoleBadge(data.admin.role)}
          </div>
          <p className="text-gray-600">
            {data.admin.title || 'Company Admin'}
            {data.company.emailDomain && (
              <span className="text-gray-400 ml-2">@{data.company.emailDomain}</span>
            )}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card variant="bordered">
          <CardContent className="py-6 text-center">
            <p className="text-4xl font-bold text-blue-600">{data.stats.employeeCount}</p>
            <p className="text-sm text-gray-600 mt-1">Active Employees</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="py-6 text-center">
            <p className="text-4xl font-bold text-yellow-600">{data.stats.pendingCount}</p>
            <p className="text-sm text-gray-600 mt-1">Pending Verification</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="py-6 text-center">
            <p className="text-4xl font-bold text-green-600">
              {data.stats.employeeCount + data.stats.pendingCount}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total Members</p>
          </CardContent>
        </Card>
      </div>

      {/* Potential Savings */}
      {!savingsLoading && savingsData && savingsData.merchants.length > 0 && (
        <Card variant="bordered" className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Potential Employee Savings</h2>
              <span className="text-sm text-gray-500">
                Based on {savingsData.employeeCount} employees
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Total savings highlight */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 text-center">
              <p className="text-sm text-green-700 mb-1">Total Potential Monthly Savings</p>
              <p className="text-4xl font-bold text-green-600">
                ${savingsData.totalPotentialMonthlySavings.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-2">
                ~${savingsData.totalPotentialAnnualSavings.toLocaleString()}/year across all partner restaurants
              </p>
            </div>

            {/* Per-merchant breakdown */}
            <div className="space-y-3">
              {savingsData.merchants.slice(0, 5).map((merchant) => (
                <div
                  key={merchant._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-semibold">
                      {merchant.businessName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{merchant.businessName}</p>
                      <p className="text-sm text-gray-500">
                        {merchant.discountPercentage}% off &middot; ~${merchant.avgOrderValue} avg
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      ${merchant.potentialMonthlySavings.toLocaleString()}/mo
                    </p>
                    <p className="text-xs text-gray-500">
                      ~${merchant.perVisitSavings.toFixed(2)}/visit
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {savingsData.merchants.length > 5 && (
              <p className="text-center text-sm text-gray-500 mt-4">
                +{savingsData.merchants.length - 5} more partner restaurants
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {data.admin.permissions.manageEmployees && (
          <Link href="/dashboard/company/employees">
            <Card variant="bordered" className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="py-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Manage Employees</h3>
                <p className="text-gray-600 text-sm">View and manage company employees</p>
              </CardContent>
            </Card>
          </Link>
        )}

        {data.admin.permissions.manageInvites && (
          <Link href="/dashboard/company/invites">
            <Card variant="bordered" className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="py-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Invite Codes</h3>
                <p className="text-gray-600 text-sm">Generate and manage invite codes</p>
              </CardContent>
            </Card>
          </Link>
        )}

        {data.admin.permissions.manageAdmins && (
          <Link href="/dashboard/company/admins">
            <Card variant="bordered" className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="py-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Manage Admins</h3>
                <p className="text-gray-600 text-sm">Add HR and other administrators</p>
              </CardContent>
            </Card>
          </Link>
        )}

        {data.admin.permissions.viewReports && (
          <Card variant="bordered" className="opacity-50">
            <CardContent className="py-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Reports</h3>
              <p className="text-gray-600 text-sm">Coming soon</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Invite Analytics */}
      {data.admin.permissions.manageInvites && data.inviteStats && (
        <Card variant="bordered" className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Invite Analytics</h2>
              <Link
                href="/dashboard/company/invites"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Manage Invites →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {/* Main Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{data.inviteStats.active}</p>
                <p className="text-xs text-green-700">Active Invites</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{data.inviteStats.used}</p>
                <p className="text-xs text-blue-700">Used</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-600">{data.inviteStats.expired}</p>
                <p className="text-xs text-gray-600">Expired</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{data.inviteStats.revoked}</p>
                <p className="text-xs text-red-700">Revoked</p>
              </div>
            </div>

            {/* Conversion Rate & Trend */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Conversion Rate */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                  <span className="text-xs text-gray-500">Used / Completed</span>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-purple-600">{data.inviteStats.conversionRate}%</span>
                </div>
                <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${data.inviteStats.conversionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {data.inviteStats.used} of {data.inviteStats.used + data.inviteStats.expired + data.inviteStats.revoked} completed invites were used
                </p>
              </div>

              {/* Recent Activity */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-4">
                <span className="text-sm font-medium text-gray-700">Recent Sign-ups via Invites</span>
                <div className="mt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last 7 days</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-cyan-600">{data.inviteStats.usedLast7Days}</span>
                      <span className="text-xs text-gray-500">employees</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last 30 days</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-blue-600">{data.inviteStats.usedLast30Days}</span>
                      <span className="text-xs text-gray-500">employees</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Total invites created</span>
                    <span className="font-medium text-gray-700">{data.inviteStats.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions Info */}
      <Card variant="bordered">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Your Permissions</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {data.admin.permissions.manageEmployees ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="text-sm text-gray-700">Manage Employees</span>
            </div>
            <div className="flex items-center gap-2">
              {data.admin.permissions.manageInvites ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="text-sm text-gray-700">Manage Invites</span>
            </div>
            <div className="flex items-center gap-2">
              {data.admin.permissions.manageAdmins ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="text-sm text-gray-700">Manage Admins</span>
            </div>
            <div className="flex items-center gap-2">
              {data.admin.permissions.viewReports ? (
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span className="text-sm text-gray-700">View Reports</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
