'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface MerchantReview {
  id: string
  businessName: string
  contactEmail: string
  contactPhone?: string
  website?: string
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED'
  createdAt: string
  locations: {
    address: string
    city: string
    state: string
  }[]
  verificationFlags?: {
    hasWebsite: boolean
    hasMultipleLocations: boolean
    recentSignup: boolean
    suspiciousEmail: boolean
  }
}

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<MerchantReview[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('pending')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchMerchants()
  }, [filter])

  const fetchMerchants = async () => {
    try {
      const response = await fetch(`/api/admin/merchants?status=${filter}`)
      const data = await response.json()
      if (data.success) {
        setMerchants(data.merchants)
      }
    } catch (error) {
      console.error('Failed to fetch merchants:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (merchantId: string) => {
    setActionLoading(merchantId)
    try {
      const response = await fetch(`/api/admin/merchants/${merchantId}/approve`, {
        method: 'POST',
      })
      const data = await response.json()

      if (data.success) {
        // Remove from list or update status
        setMerchants(prev => prev.filter(m => m.id !== merchantId))
      } else {
        alert(data.error || 'Failed to approve merchant')
      }
    } catch (error) {
      alert('Error approving merchant')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (merchantId: string, reason: string) => {
    if (!confirm('Are you sure you want to reject this merchant?')) return

    setActionLoading(merchantId)
    try {
      const response = await fetch(`/api/admin/merchants/${merchantId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const data = await response.json()

      if (data.success) {
        setMerchants(prev => prev.filter(m => m.id !== merchantId))
      } else {
        alert(data.error || 'Failed to reject merchant')
      }
    } catch (error) {
      alert('Error rejecting merchant')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspend = async (merchantId: string) => {
    const reason = prompt('Reason for suspension:')
    if (!reason) return

    setActionLoading(merchantId)
    try {
      const response = await fetch(`/api/admin/merchants/${merchantId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      })
      const data = await response.json()

      if (data.success) {
        fetchMerchants()
      } else {
        alert(data.error || 'Failed to suspend merchant')
      }
    } catch (error) {
      alert('Error suspending merchant')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Merchant Management</h1>
        <p className="text-gray-600">Review and approve merchant applications</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'pending' ? 'primary' : 'outline'}
          onClick={() => setFilter('pending')}
        >
          Pending ({merchants.filter(m => m.status === 'PENDING').length})
        </Button>
        <Button
          variant={filter === 'active' ? 'primary' : 'outline'}
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'suspended' ? 'primary' : 'outline'}
          onClick={() => setFilter('suspended')}
        >
          Suspended
        </Button>
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All Merchants
        </Button>
      </div>

      {/* Merchant List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading merchants...</p>
        </div>
      ) : merchants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No {filter !== 'all' ? filter : ''} merchants found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {merchants.map((merchant) => (
            <Card key={merchant.id} variant="bordered">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {merchant.businessName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Applied {new Date(merchant.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      merchant.status === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : merchant.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {merchant.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Contact Email</p>
                    <p className="font-medium">{merchant.contactEmail}</p>
                  </div>
                  {merchant.contactPhone && (
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium">{merchant.contactPhone}</p>
                    </div>
                  )}
                  {merchant.website && (
                    <div>
                      <p className="text-sm text-gray-600">Website</p>
                      <a
                        href={merchant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        {merchant.website}
                      </a>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Locations</p>
                    <p className="font-medium">
                      {merchant.locations[0]?.city}, {merchant.locations[0]?.state}
                      {merchant.locations.length > 1 && ` +${merchant.locations.length - 1} more`}
                    </p>
                  </div>
                </div>

                {/* Fraud Detection Flags */}
                {merchant.verificationFlags && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Verification Checks:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        {merchant.verificationFlags.hasWebsite ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                        <span>Has Website</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!merchant.verificationFlags.suspiciousEmail ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">⚠</span>
                        )}
                        <span>Email Valid</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {merchant.verificationFlags.hasMultipleLocations ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                        <span>Multiple Locations</span>
                      </div>
                      {merchant.verificationFlags.recentSignup && (
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-600">⚠</span>
                          <span>New Signup</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {merchant.status === 'PENDING' && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => handleApprove(merchant.id)}
                        disabled={actionLoading === merchant.id}
                      >
                        {actionLoading === merchant.id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() =>
                          handleReject(merchant.id, 'Did not meet requirements')
                        }
                        disabled={actionLoading === merchant.id}
                      >
                        {actionLoading === merchant.id ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </>
                  )}
                  {merchant.status === 'ACTIVE' && (
                    <Button
                      variant="danger"
                      onClick={() => handleSuspend(merchant.id)}
                      disabled={actionLoading === merchant.id}
                    >
                      {actionLoading === merchant.id ? 'Suspending...' : 'Suspend'}
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => window.open(`/merchant/${merchant.id}`, '_blank')}>
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
