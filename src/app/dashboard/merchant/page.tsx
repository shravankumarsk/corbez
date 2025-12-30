import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default async function MerchantDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h1>
        <p className="text-gray-600 mt-1">Verify employees and manage your corporate discount program</p>
      </div>

      {/* Trial Status */}
      <Card variant="bordered" className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-blue-900">Free Trial Active</p>
                <p className="text-sm text-blue-700">6 months free - then $9.99/month</p>
              </div>
            </div>
            <Link href="/dashboard/merchant/billing">
              <Button variant="outline" size="sm">
                View Plan
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link href="/dashboard/merchant/scanner">
          <Card variant="bordered" className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Scan Employee QR</h3>
              <p className="text-gray-600 text-sm">Verify an employee for their corporate discount</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/merchant/discounts">
          <Card variant="bordered" className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="py-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Manage Discounts</h3>
              <p className="text-gray-600 text-sm">Set up custom discount tiers for companies</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <Card variant="bordered" className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">This Month</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-600 mt-1">Verifications</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600 mt-1">Unique Employees</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600 mt-1">Companies</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card variant="bordered">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Recent Verifications</h2>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p>No verifications yet</p>
            <p className="text-sm mt-1">Start scanning employee QR codes to see activity here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
