'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import QRCodeDisplay from '@/components/wallet/QRCodeDisplay'

interface Coupon {
  id: string
  code: string
  status: string
  merchant: {
    name: string
    logo?: string
  }
  discount: {
    name: string
    percentage: number
    type: string
  }
  claimedAt: string
  expiresAt: string
  qrCodeUrl: string
  verificationUrl: string
}

interface EmployeePass {
  passId: string
  qrCodeDataUrl: string
  qrCodeSvg: string
  verificationUrl: string
  issuedAt: string
  usageCount: number
}

interface WalletData {
  success: boolean
  canAccess: boolean
  reason?: string
  status: string
  pass: EmployeePass | null
  coupons: Coupon[]
}

export default function WalletPage() {
  const { data: session } = useSession()
  const [walletData, setWalletData] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [walletLoading, setWalletLoading] = useState<'apple' | 'google' | null>(null)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pass' | 'coupons'>('pass')
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)

  const fetchWalletData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/employee/wallet')
      const data = await response.json()

      if (response.ok) {
        setWalletData(data)
      } else {
        setError(data.error || 'Failed to load wallet')
      }
    } catch (err) {
      console.error('Wallet fetch error:', err)
      setError('Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWalletData()
  }, [fetchWalletData])

  const handleAppleWalletDownload = async () => {
    setWalletLoading('apple')
    setWalletError(null)

    try {
      const response = await fetch('/api/wallet/apple')
      const contentType = response.headers.get('content-type')

      if (contentType?.includes('application/json')) {
        const data = await response.json()
        if (!data.success) {
          setWalletError(data.configured === false
            ? 'Apple Wallet requires setup. Contact your administrator.'
            : data.error || 'Failed to generate pass')
        }
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'corbe-pass.pkpass'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      setWalletError('Failed to download pass. Please try again.')
    } finally {
      setWalletLoading(null)
    }
  }

  const handleGoogleWalletAdd = async () => {
    setWalletLoading('google')
    setWalletError(null)

    try {
      const response = await fetch('/api/wallet/google')
      const data = await response.json()

      if (!data.success) {
        setWalletError(data.configured === false
          ? 'Google Wallet requires setup. Contact your administrator.'
          : data.error || 'Failed to generate pass')
        return
      }

      if (data.saveUrl) {
        window.open(data.saveUrl, '_blank')
      }
    } catch {
      setWalletError('Failed to add to Google Wallet. Please try again.')
    } finally {
      setWalletLoading(null)
    }
  }

  const isVerified = session?.user?.isEmailVerified

  if (loading) {
    return (
      <div className="max-w-lg mx-auto flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-500 text-sm">Loading your wallet...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto">
        <Card variant="bordered">
          <CardContent className="py-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Unable to Load Wallet</h3>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <Button variant="primary" size="sm" onClick={fetchWalletData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isVerified) {
    return (
      <div className="max-w-lg mx-auto">
        <Card variant="bordered">
          <CardContent className="py-8 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Email Not Verified</h3>
            <p className="text-gray-500 text-sm mb-4">Verify your email to access your digital wallet</p>
            <Button variant="primary" size="sm">Verify Email</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (walletData && !walletData.canAccess) {
    return (
      <div className="max-w-lg mx-auto">
        <Card variant="bordered">
          <CardContent className="py-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h3 className="font-medium text-gray-900 mb-1">Access Restricted</h3>
            <p className="text-gray-500 text-sm mb-2">{walletData.reason || 'Your account access is currently restricted.'}</p>
            <p className="text-xs text-gray-400">Status: {walletData.status}</p>
            <p className="text-xs text-gray-400 mt-4">
              If you believe this is an error, please contact your HR administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeCoupons = walletData?.coupons?.filter(c => c.status === 'ACTIVE') || []
  const expiredCoupons = walletData?.coupons?.filter(c => c.status !== 'ACTIVE') || []

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('pass')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'pass'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Employee Pass
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors relative ${
            activeTab === 'coupons'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Coupons
          {activeCoupons.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeCoupons.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'pass' && (
        <>
          {/* Employee Pass QR Code */}
          <Card variant="bordered">
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Your Employee ID</h3>
              <p className="text-sm text-gray-500">Show this to verify your employee status</p>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col items-center">
                {walletData?.pass?.qrCodeDataUrl ? (
                  <>
                    <div className="bg-white p-3 rounded-xl border-2 border-gray-100 shadow-inner">
                      <Image
                        src={walletData.pass.qrCodeDataUrl}
                        alt="Employee Pass QR Code"
                        width={192}
                        height={192}
                        className="rounded-lg"
                      />
                    </div>
                    <p className="mt-3 text-xs text-gray-500 font-mono">{walletData.pass.passId}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Used {walletData.pass.usageCount} {walletData.pass.usageCount === 1 ? 'time' : 'times'}
                    </p>
                  </>
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 text-sm">No pass available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card variant="bordered">
            <CardContent className="py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="text-gray-900 font-medium truncate ml-4">{session?.user?.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${
                  walletData?.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {walletData?.status || 'Unknown'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Pass Downloads */}
          <Card variant="bordered">
            <CardContent className="py-4">
              <p className="text-sm text-gray-600 mb-3">Add to your phone wallet for quick access</p>

              {walletError && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-600">{walletError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  onClick={handleAppleWalletDownload}
                  isLoading={walletLoading === 'apple'}
                  disabled={walletLoading !== null}
                >
                  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Apple
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-center"
                  onClick={handleGoogleWalletAdd}
                  isLoading={walletLoading === 'google'}
                  disabled={walletLoading !== null}
                >
                  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44-3.84 0-7.13-3.05-7.13-7.25 0-4.07 3.13-7.27 7.13-7.27 3.06 0 4.86 1.95 4.86 1.95l1.91-1.91s-2.33-2.68-6.86-2.68C6.36 2.11 2 6.72 2 12.05c0 5.19 4.08 9.94 10.19 9.94 5.33 0 9.25-3.67 9.25-9.1 0-1.19-.13-1.79-.13-1.79h-.01z" />
                  </svg>
                  Google
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'coupons' && (
        <>
          {activeCoupons.length === 0 && expiredCoupons.length === 0 ? (
            <Card variant="bordered">
              <CardContent className="py-8 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">No Coupons Yet</h3>
                <p className="text-gray-500 text-sm">
                  Browse nearby restaurants to claim exclusive discounts!
                </p>
                <Link href="/dashboard/employee/explore">
                  <Button variant="primary" size="sm" className="mt-4">
                    Explore Restaurants
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Active Coupons */}
              {activeCoupons.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Active Coupons</h4>
                  {activeCoupons.map((coupon) => (
                    <Card
                      key={coupon.id}
                      variant="bordered"
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => setSelectedCoupon(coupon)}
                    >
                      <CardContent className="py-3">
                        <div className="flex items-center gap-3">
                          {coupon.merchant.logo ? (
                            <Image
                              src={coupon.merchant.logo}
                              alt={coupon.merchant.name}
                              width={48}
                              height={48}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-primary font-bold text-lg">
                                {coupon.merchant.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-900 truncate">{coupon.merchant.name}</h5>
                            <p className="text-sm text-gray-500">{coupon.discount.name}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-2 py-1 rounded">
                              {coupon.discount.percentage}% OFF
                            </span>
                            <p className="text-xs text-gray-400 mt-1">
                              Expires {new Date(coupon.expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Expired/Used Coupons */}
              {expiredCoupons.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h4 className="text-sm font-medium text-gray-400">Past Coupons</h4>
                  {expiredCoupons.map((coupon) => (
                    <Card key={coupon.id} variant="bordered" className="opacity-60">
                      <CardContent className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 font-bold text-lg">
                              {coupon.merchant.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-gray-600 truncate">{coupon.merchant.name}</h5>
                            <p className="text-sm text-gray-400">{coupon.discount.name}</p>
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            coupon.status === 'REDEEMED'
                              ? 'bg-blue-100 text-blue-700'
                              : coupon.status === 'EXPIRED'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {coupon.status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Coupon Detail Modal */}
      {selectedCoupon && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCoupon(null)}
        >
          <div
            className="max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <QRCodeDisplay
              code={selectedCoupon.code}
              qrCodeUrl={selectedCoupon.qrCodeUrl}
              title={selectedCoupon.merchant.name}
              subtitle={`${selectedCoupon.discount.percentage}% off - ${selectedCoupon.discount.name}`}
              expiresAt={selectedCoupon.expiresAt}
              size="lg"
              variant="modal"
              showDownload={true}
              showActions={true}
            />
            <button
              onClick={() => setSelectedCoupon(null)}
              className="mt-3 w-full py-2 text-white bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
