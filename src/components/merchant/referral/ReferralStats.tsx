'use client'

interface ReferralStatsProps {
  stats: {
    totalReferred: number
    totalRegistered: number
    totalConverted: number
    monthsEarned: number
    availableMonths: number
    conversionRate: number
  }
}

export default function ReferralStats({ stats }: ReferralStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Referred */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
        </div>
        <p className="text-sm text-muted mb-1">Total Referred</p>
        <p className="text-3xl font-bold text-secondary">{stats.totalReferred}</p>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-muted">Restaurants you've invited</p>
        </div>
      </div>

      {/* Registered */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
        </div>
        <p className="text-sm text-muted mb-1">Signed Up</p>
        <p className="text-3xl font-bold text-purple-600">{stats.totalRegistered}</p>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-muted">
            {stats.totalReferred > 0
              ? `${((stats.totalRegistered / stats.totalReferred) * 100).toFixed(0)}% signup rate`
              : 'Awaiting signups'}
          </p>
        </div>
      </div>

      {/* Converted to Paying */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
        <p className="text-sm text-muted mb-1">Converted to Paying</p>
        <p className="text-3xl font-bold text-green-600">{stats.totalConverted}</p>
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-muted">
            {stats.totalReferred > 0
              ? `${stats.conversionRate.toFixed(0)}% conversion rate`
              : 'Became paying customers'}
          </p>
        </div>
      </div>

      {/* Months Earned */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-6 text-white hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          </div>
        </div>
        <p className="text-sm text-white/80 mb-1">Total Months Earned</p>
        <p className="text-3xl font-bold">{stats.monthsEarned}</p>
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/80">Available to claim:</p>
            <p className="text-sm font-bold">{stats.availableMonths} months</p>
          </div>
        </div>
      </div>
    </div>
  )
}
