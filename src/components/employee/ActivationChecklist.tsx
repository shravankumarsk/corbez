'use client'

import { useState } from 'react'

export interface OnboardingProgress {
  emailVerified: boolean
  companyLinked: boolean
  firstDiscountClaimed: boolean
  firstDiscountUsed: boolean
  walletPassAdded: boolean
  firstReferralSent: boolean
  completedAt?: Date
}

interface ChecklistItem {
  id: keyof OnboardingProgress
  title: string
  description: string
  unlocks: string
  icon: string
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'emailVerified',
    title: 'Verify your email',
    description: 'Check your inbox and click the verification link',
    unlocks: 'Browse restaurants',
    icon: '✉️',
  },
  {
    id: 'companyLinked',
    title: 'Link to your company',
    description: 'Join your company to unlock exclusive discounts',
    unlocks: 'Access company discounts',
    icon: '🏢',
  },
  {
    id: 'firstDiscountClaimed',
    title: 'Claim your first discount',
    description: 'Browse restaurants and add a discount to your wallet',
    unlocks: 'QR code for redemption',
    icon: '🎟️',
  },
  {
    id: 'walletPassAdded',
    title: 'Add to Apple/Google Wallet',
    description: 'Quick access to your employee pass',
    unlocks: 'Faster checkout',
    icon: '📱',
  },
  {
    id: 'firstDiscountUsed',
    title: 'Use your first discount',
    description: 'Visit a restaurant and show your QR code',
    unlocks: 'VIP status unlocked!',
    icon: '⭐',
  },
  {
    id: 'firstReferralSent',
    title: 'Refer a friend',
    description: 'Share Corbez with colleagues from other companies',
    unlocks: 'Earn 100 Corbez Points',
    icon: '🎁',
  },
]

interface ActivationChecklistProps {
  progress: OnboardingProgress
  userName?: string
}

export function ActivationChecklist({ progress, userName }: ActivationChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Calculate completion percentage
  const totalSteps = CHECKLIST_ITEMS.length
  const completedSteps = CHECKLIST_ITEMS.filter((item) => progress[item.id]).length
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100)

  // Check if fully completed
  const isFullyCompleted = completedSteps === totalSteps

  // Don't show checklist if completed more than 7 days ago
  if (isFullyCompleted && progress.completedAt) {
    const daysSinceCompletion = Math.floor(
      (Date.now() - new Date(progress.completedAt).getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysSinceCompletion > 7) {
      return null
    }
  }

  return (
    <div className="bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-secondary">
              {isFullyCompleted ? '🎉 Welcome aboard!' : `Welcome${userName ? `, ${userName}` : ''}!`}
            </h3>
            {isFullyCompleted && (
              <span className="px-2 py-0.5 bg-accent text-white text-xs font-semibold rounded-full">
                COMPLETE
              </span>
            )}
          </div>
          <p className="text-sm text-muted">
            {isFullyCompleted
              ? "You've unlocked all features. Start saving!"
              : 'Complete these steps to unlock all features'}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
          aria-label={isExpanded ? 'Collapse checklist' : 'Expand checklist'}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            {completedSteps} of {totalSteps} completed
          </span>
          <span className="text-sm font-bold text-primary">{completionPercentage}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Checklist Items */}
      {isExpanded && (
        <div className="space-y-3">
          {CHECKLIST_ITEMS.map((item, index) => {
            const isCompleted = progress[item.id]
            const isNext = !isCompleted && CHECKLIST_ITEMS.slice(0, index).every((i) => progress[i.id])

            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                  isCompleted
                    ? 'bg-green-50 border border-green-200'
                    : isNext
                    ? 'bg-white border-2 border-primary shadow-sm'
                    : 'bg-gray-50 border border-gray-200 opacity-60'
                }`}
              >
                {/* Icon/Checkbox */}
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isNext ? 'border-primary bg-primary/10' : 'border-gray-300'
                      }`}
                    >
                      {isNext && <div className="w-2 h-2 rounded-full bg-primary"></div>}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4
                        className={`font-semibold text-sm mb-0.5 ${
                          isCompleted ? 'text-green-900 line-through' : 'text-secondary'
                        }`}
                      >
                        {item.icon} {item.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-1">{item.description}</p>
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-xs font-medium text-accent">Unlocks: {item.unlocks}</span>
                      </div>
                    </div>

                    {/* Next indicator */}
                    {isNext && (
                      <span className="flex-shrink-0 px-2 py-1 bg-primary text-white text-xs font-bold rounded-full">
                        NEXT
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Completion Celebration */}
      {isFullyCompleted && isExpanded && (
        <div className="mt-4 p-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl text-center">
          <div className="text-2xl mb-2">🎉 🎊 ✨</div>
          <h4 className="font-bold mb-1">All Set! You're a Corbez Pro!</h4>
          <p className="text-sm opacity-90">
            You've unlocked all features. Start exploring restaurants and saving money!
          </p>
        </div>
      )}
    </div>
  )
}
