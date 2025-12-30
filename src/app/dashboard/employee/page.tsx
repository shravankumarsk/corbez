import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ResendVerificationButton from '@/components/auth/ResendVerificationButton'

export default async function EmployeeDashboard() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const isVerified = session.user.isEmailVerified

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      <Card variant="bordered">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-full ${isVerified ? 'bg-green-100' : 'bg-yellow-100'}`}
            >
              {isVerified ? (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {isVerified ? 'Email Verified' : 'Verification Required'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {isVerified
                      ? 'You can access all benefits'
                      : 'Verify to access discounts'}
                  </p>
                </div>
                {!isVerified && session.user.email && (
                  <ResendVerificationButton email={session.user.email} />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/dashboard/employee/wallet" className="block">
          <Card variant="bordered" className="hover:shadow-md hover:border-blue-200 transition-all h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">Show QR Code</h3>
                  <p className="text-gray-500 text-xs">For restaurant staff</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/employee/wallet" className="block">
          <Card variant="bordered" className="hover:shadow-md hover:border-purple-200 transition-all h-full">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">Wallet Pass</h3>
                  <p className="text-gray-500 text-xs">Add to Apple/Google</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <Card variant="bordered">
        <CardContent className="py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-xs text-gray-500">Verifications</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">$0</p>
              <p className="text-xs text-gray-500">Total Saved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-xs text-gray-500">Restaurants</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
