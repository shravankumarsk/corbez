'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface ReferralStats {
  pending: number
  registered: number
  completed: number
  total: number
  sameCompany: number
}

interface ReferralData {
  referralCode: string
  referralLink: string
  companyName: string | null
  companyId: string | null
  stats: ReferralStats
  recentReferrals: {
    id: string
    email: string | null
    user: {
      firstName: string
      lastName: string
      email: string
    } | null
    status: string
    sameCompany: boolean
    createdAt: string
    registeredAt: string | null
  }[]
}

export default function ReferFriendsPage() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Invite form state
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteResult, setInviteResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchReferralData()
  }, [])

  async function fetchReferralData() {
    try {
      const response = await fetch('/api/referral')
      if (response.ok) {
        const data = await response.json()
        setReferralData(data)
      }
    } catch (error) {
      console.error('Failed to fetch referral data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function copyToClipboard() {
    if (!referralData?.referralLink) return

    try {
      await navigator.clipboard.writeText(referralData.referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail) return

    setInviteSending(true)
    setInviteResult(null)

    try {
      const response = await fetch('/api/referral/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          message: inviteMessage,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setInviteResult({ type: 'success', text: 'Invite sent successfully!' })
        setInviteEmail('')
        setInviteMessage('')
        fetchReferralData() // Refresh data
      } else {
        setInviteResult({ type: 'error', text: data.message || 'Failed to send invite' })
      }
    } catch (error) {
      setInviteResult({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setInviteSending(false)
    }
  }

  function shareVia(platform: 'whatsapp' | 'twitter' | 'email') {
    if (!referralData?.referralLink) return

    const message = `Join me on corbez and get exclusive discounts at local restaurants! ${referralData.referralLink}`

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, '_blank')
        break
      case 'email':
        window.open(`mailto:?subject=Join me on corbez!&body=${encodeURIComponent(message)}`, '_blank')
        break
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card variant="bordered">
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-primary">{referralData?.stats.total || 0}</p>
            <p className="text-xs text-gray-500">Invites</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-green-600">{referralData?.stats.registered || 0}</p>
            <p className="text-xs text-gray-500">Joined</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="py-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{referralData?.stats.sameCompany || 0}</p>
            <p className="text-xs text-gray-500">Same Co.</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card variant="bordered">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={referralData?.referralLink || ''}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
            />
            <Button onClick={copyToClipboard} variant="secondary" size="sm">
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => shareVia('whatsapp')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
            <button
              onClick={() => shareVia('twitter')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-500 text-white text-sm rounded-lg hover:bg-sky-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </button>
            <button
              onClick={() => shareVia('email')}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Direct Invite Form */}
      <Card variant="bordered">
        <CardContent className="py-4">
          <form onSubmit={handleInvite} className="space-y-3">
            <div>
              <label htmlFor="inviteEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Invite by email
              </label>
              <input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com"
                required
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="inviteMessage" className="block text-sm font-medium text-gray-700 mb-1">
                Message <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="inviteMessage"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Hey! Check out this app..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>

            {inviteResult && (
              <div
                className={`px-3 py-2 rounded-lg text-sm ${
                  inviteResult.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {inviteResult.text}
              </div>
            )}

            <Button type="submit" disabled={inviteSending} className="w-full" size="sm">
              {inviteSending ? 'Sending...' : 'Send Invite'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Referrals */}
      {referralData?.recentReferrals && referralData.recentReferrals.length > 0 && (
        <Card variant="bordered">
          <CardContent className="py-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Recent Invites</p>
            <div className="space-y-2">
              {referralData.recentReferrals.map((referral) => (
                <div
                  key={referral.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {referral.user
                        ? `${referral.user.firstName} ${referral.user.lastName}`
                        : referral.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ml-2 ${
                      referral.status === 'REGISTERED' || referral.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {referral.status === 'PENDING' ? 'Pending' : 'Joined'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
