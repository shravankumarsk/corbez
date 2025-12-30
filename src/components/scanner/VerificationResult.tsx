'use client'

import Button from '@/components/ui/Button'

interface DiscountInfo {
  percentage: number
  name: string
  type: string
}

interface VerificationResultProps {
  success: boolean
  employeeName?: string
  companyName?: string
  discount?: DiscountInfo
  errorMessage?: string
  onReset: () => void
}

export default function VerificationResult({
  success,
  employeeName,
  companyName,
  discount,
  errorMessage,
  onReset,
}: VerificationResultProps) {
  const getDiscountTypeLabel = (type: string) => {
    switch (type) {
      case 'BASE':
        return 'Standard Discount'
      case 'COMPANY':
        return 'Company Special'
      case 'SPEND_THRESHOLD':
        return 'Spend Bonus'
      default:
        return ''
    }
  }

  const hasDiscount = discount && discount.percentage > 0

  return (
    <div className="text-center py-8">
      {success ? (
        <>
          {/* Success state */}
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-green-600 mb-2">Verified!</h2>
          <p className="text-gray-600 mb-6">
            {hasDiscount
              ? 'This employee is eligible for a discount.'
              : 'Employee verified, but no discount is configured.'}
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-sm mx-auto">
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-500">Employee</dt>
                <dd className="text-gray-900 font-medium">{employeeName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Company</dt>
                <dd className="text-gray-900 font-medium">{companyName}</dd>
              </div>
              {hasDiscount && (
                <>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <dt className="text-gray-500">Discount</dt>
                    <dd className="text-2xl font-bold text-green-600">{discount.percentage}% OFF</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Type</dt>
                    <dd className="text-gray-700 text-sm">
                      {discount.name}
                      <span className="block text-xs text-gray-400">
                        {getDiscountTypeLabel(discount.type)}
                      </span>
                    </dd>
                  </div>
                </>
              )}
              {!hasDiscount && (
                <div className="pt-3 border-t border-gray-200 text-center">
                  <p className="text-sm text-yellow-600">
                    Configure discounts in your settings
                  </p>
                </div>
              )}
            </dl>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            {hasDiscount
              ? 'Apply the discount to this order. The employee has been verified.'
              : 'The employee is verified. Add discounts in Manage Discounts.'}
          </p>
        </>
      ) : (
        <>
          {/* Error state */}
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-red-600 mb-2">Not Verified</h2>
          <p className="text-gray-600 mb-6">{errorMessage || 'This code is invalid or has expired.'}</p>

          <div className="bg-red-50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
            <p className="text-sm text-red-800">
              The employee should refresh their QR code and try again. If the issue persists, they may need to
              verify their email.
            </p>
          </div>
        </>
      )}

      <Button variant="outline" onClick={onReset}>
        Scan Another Code
      </Button>
    </div>
  )
}
