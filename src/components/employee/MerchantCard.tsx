'use client'

import Image from 'next/image'
import Button from '@/components/ui/Button'

interface MerchantCardProps {
  merchant: {
    id: string
    businessName: string
    logo?: string
    description?: string
    address: {
      city: string
      state: string
    }
    distance?: number
    discount: {
      id: string
      percentage: number
      isNegotiated: boolean
      monthlyUsageLimit?: number | null
    } | null
    hasClaimed: boolean
  }
  onClaim: (merchantId: string, discountId: string) => void
  isLoading?: boolean
}

export default function MerchantCard({ merchant, onClaim, isLoading }: MerchantCardProps) {
  const handleClaim = () => {
    if (merchant.discount && !merchant.hasClaimed) {
      onClaim(merchant.id, merchant.discount.id)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header with Logo */}
      <div className="p-4 flex items-start gap-4">
        {merchant.logo ? (
          <Image
            src={merchant.logo}
            alt={merchant.businessName}
            width={64}
            height={64}
            className="rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-2xl">
              {merchant.businessName.charAt(0)}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{merchant.businessName}</h3>
          <p className="text-sm text-gray-500">
            {merchant.address.city}, {merchant.address.state}
            {merchant.distance !== undefined && (
              <span className="ml-2 text-gray-400">
                ({merchant.distance} km away)
              </span>
            )}
          </p>
          {merchant.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {merchant.description}
            </p>
          )}
        </div>
      </div>

      {/* Discount Info & Action */}
      {merchant.discount && (
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">
                {merchant.discount.percentage}%
              </span>
              <span className="text-gray-600 text-sm">off</span>
              {merchant.discount.isNegotiated && (
                <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  Negotiated Rate
                </span>
              )}
              {merchant.discount.monthlyUsageLimit && (
                <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {merchant.discount.monthlyUsageLimit}x/month
                </span>
              )}
            </div>

            {merchant.hasClaimed ? (
              <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1.5 rounded-lg">
                Already Claimed
              </span>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleClaim}
                isLoading={isLoading}
                disabled={isLoading}
              >
                Claim {merchant.discount.percentage}% Off
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
