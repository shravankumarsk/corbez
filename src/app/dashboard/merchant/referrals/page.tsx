'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePromotion } from '@/lib/hooks/usePromotion'

interface ReferralStats {
  totalReferred: number
  totalConverted: number
  totalRewardsClaimed: number
  monthsEarned: number
  conversionRate: number
}

interface Referral {
  _id: string
  referredBusinessName: string
  referredEmail: string
  referredContactName?: string
  status: string
  createdAt: string
  registeredAt?: string
  convertedAt?: string
  referrerRewardAmount: number
  referrerRewardClaimed: boolean
}

export default function MerchantReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const promo = usePromotion()

  // Referral bonus is current trial + 3 months
  const referralBonusMonths = promo.trialMonths + 3

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}/refer-a-restaurant`
    : ''

  useEffect(() => {
    fetchReferrals()
  }, [])

  const fetchReferrals = async () => {
    try {
      const response = await fetch('/api/merchant/referral')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch referrals')
      }

      setReferrals(data.referrals || [])
      setStats(data.stats || {
        totalReferred: 0,
        totalConverted: 0,
        totalRewardsClaimed: 0,
        monthsEarned: 0,
        conversionRate: 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-700'
      case 'CONTACTED':
        return 'bg-blue-100 text-blue-700'
      case 'REGISTERED':
        return 'bg-green-100 text-green-700'
      case 'TRIAL_ACTIVE':
        return 'bg-purple-100 text-purple-700'
      case 'CONVERTED':
        return 'bg-emerald-100 text-emerald-700'
      case 'CHURNED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Awaiting Contact'
      case 'CONTACTED':
        return 'Contacted'
      case 'REGISTERED':
        return 'Signed Up'
      case 'TRIAL_ACTIVE':
        return 'In Trial'
      case 'CONVERTED':
        return 'Converted'
      case 'CHURNED':
        return 'Cancelled'
      default:
        return status
    }
  }

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const shareViaEmail = () => {
    const subject = 'Join Corbez and fill your empty tables'
    const body = `Hi,\n\nI've been using Corbez to attract more corporate customers, and I think you'd love it too.\n\nCorbez connects local restaurants with thousands of corporate employees looking for places to eat. You set the discounts, and they become your regulars.\n\nBest part? You get ${referralBonusMonths} months completely free to try it (vs the standard ${promo.trialText}), and I earn rewards when you join.\n\nCheck it out: ${referralLink}\n\nLet me know if you have questions!`

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const shareViaWhatsApp = () => {
    const message = `Hey! I've been using Corbez to attract more corporate customers. You should check it out - you get ${referralBonusMonths} months free to try it: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary mb-2">Referrals</h1>
        <p className="text-muted">
          Refer other restaurants and earn up to 3 months free for each successful referral.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted mb-1">Total Referred</p>
            <p className="text-3xl font-bold text-secondary">{stats.totalReferred}</p>
            <p className="text-xs text-muted mt-2">Restaurants you've invited</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted mb-1">Converted</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalConverted}</p>
            <p className="text-xs text-muted mt-2">
              {stats.totalReferred > 0
                ? `${stats.conversionRate.toFixed(0)}% conversion rate`
                : 'Became paying customers'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted mb-1">Months Earned</p>
            <p className="text-3xl font-bold text-primary">{stats.monthsEarned}</p>
            <p className="text-xs text-muted mt-2">Free months claimed</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
            <p className="text-sm text-muted mb-1">Pending Rewards</p>
            <p className="text-3xl font-bold text-purple-600">
              {referrals.filter(r => !r.referrerRewardClaimed && r.status === 'CONVERTED').length}
            </p>
            <p className="text-xs text-muted mt-2">Ready to claim</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <Link
          href="/refer-a-restaurant"
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Refer a Restaurant
        </Link>

        <div className="flex gap-3">
          <button
            onClick={copyReferralLink}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-secondary border-2 border-gray-200 px-4 py-3 rounded-xl font-medium transition-all"
          >
            {copiedLink ? (
              <>
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </>
            )}
          </button>

          <button
            onClick={shareViaEmail}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-secondary border-2 border-gray-200 px-4 py-3 rounded-xl font-medium transition-all"
            title="Share via Email"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </button>

          <button
            onClick={shareViaWhatsApp}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-secondary border-2 border-gray-200 px-4 py-3 rounded-xl font-medium transition-all"
            title="Share via WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </button>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-secondary">Referral History</h2>
        </div>

        {referrals.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-secondary mb-2">No referrals yet</h3>
            <p className="text-muted mb-6">Start referring restaurants to earn free months!</p>
            <Link
              href="/refer-a-restaurant"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Make Your First Referral
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referred
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reward
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {referrals.map((referral) => (
                  <tr key={referral._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-secondary">{referral.referredBusinessName}</div>
                      {referral.referredContactName && (
                        <div className="text-sm text-muted">{referral.referredContactName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <a href={`mailto:${referral.referredEmail}`} className="text-sm text-primary hover:text-primary-dark">
                        {referral.referredEmail}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                        {getStatusLabel(referral.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(referral.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {referral.referrerRewardClaimed ? (
                        <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {referral.referrerRewardAmount} mo claimed
                        </span>
                      ) : referral.status === 'CONVERTED' ? (
                        <span className="text-sm text-purple-600 font-medium">
                          {referral.referrerRewardAmount} mo pending
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="mt-8 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-secondary mb-2">How referral rewards work</h3>
            <ul className="text-sm text-muted space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>Earn <strong>1 month free</strong> when your referral signs up</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>Earn <strong>2 more months</strong> when they process 10+ verifications and convert to paying</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>Your referral gets <strong>{referralBonusMonths} months free</strong> (vs standard {promo.trialText})</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>Maximum <strong>{promo.trialMonths * 2} months free rewards per year</strong></span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
