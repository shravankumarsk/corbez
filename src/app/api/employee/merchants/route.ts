import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Employee } from '@/lib/db/models/employee.model'
import { Merchant, MerchantStatus } from '@/lib/db/models/merchant.model'
import { Discount, DiscountType } from '@/lib/db/models/discount.model'
import { couponService } from '@/lib/services/coupon.service'
import { moderationService } from '@/lib/services/moderation.service'

interface MerchantWithDiscount {
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
    type: string
    name: string
    percentage: number
    isNegotiated: boolean
    monthlyUsageLimit?: number | null
  } | null
  hasClaimed: boolean
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    await connectDB()

    // Get employee with company info
    const employee = await Employee.findOne({ userId: session.user.id })
      .populate('companyId', 'name')

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Check access
    const access = await moderationService.canAccessFeatures(employee._id.toString())
    if (!access.canAccess) {
      return NextResponse.json({
        success: false,
        error: access.reason,
        merchants: [],
      }, { status: 403 })
    }

    const companyName = (employee.companyId as unknown as { name: string })?.name

    // Build merchant query
    const merchantQuery: Record<string, unknown> = {
      status: MerchantStatus.ACTIVE,
    }

    if (search) {
      merchantQuery.businessName = { $regex: search, $options: 'i' }
    }

    // Get all active merchants
    const merchants = await Merchant.find(merchantQuery)
      .select('businessName logo description locations')
      .lean() as unknown as Array<{
        _id: { toString(): string }
        businessName: string
        logo?: string
        description?: string
        locations?: Array<{
          city?: string
          state?: string
          coordinates?: { lat?: number; lng?: number }
        }>
      }>

    if (merchants.length === 0) {
      return NextResponse.json({
        success: true,
        merchants: [],
      })
    }

    // Get merchant IDs
    const merchantIds = merchants.map(m => m._id)

    // Define discount type for lean query
    interface LeanDiscount {
      _id: { toString(): string }
      merchantId: { toString(): string }
      type: string
      name: string
      percentage: number
      companyName?: string
      monthlyUsageLimit?: number | null
    }

    // Get all active discounts for these merchants
    const discounts = await Discount.find({
      merchantId: { $in: merchantIds },
      isActive: true,
    }).lean() as unknown as LeanDiscount[]

    // Group discounts by merchant
    const discountsByMerchant = new Map<string, LeanDiscount[]>()
    for (const discount of discounts) {
      const merchantId = discount.merchantId.toString()
      if (!discountsByMerchant.has(merchantId)) {
        discountsByMerchant.set(merchantId, [])
      }
      discountsByMerchant.get(merchantId)!.push(discount)
    }

    // Get claimed merchant IDs for this employee
    const claimedMerchantIds = await couponService.getClaimedMerchantIds(employee._id.toString())
    const claimedSet = new Set(claimedMerchantIds)

    // Build response with applicable discounts
    const merchantsWithDiscounts: MerchantWithDiscount[] = []

    for (const merchant of merchants) {
      const merchantDiscounts = discountsByMerchant.get(merchant._id.toString()) || []

      // Skip merchants with no discounts
      if (merchantDiscounts.length === 0) {
        continue
      }

      // Find the best applicable discount
      // Priority: COMPANY (if matches) > BASE
      let applicableDiscount: LeanDiscount | null = null
      let isNegotiated = false

      // First check for company-specific discount
      if (companyName) {
        const companyDiscount = merchantDiscounts.find(
          d => d.type === DiscountType.COMPANY &&
               d.companyName?.toLowerCase() === companyName.toLowerCase()
        )
        if (companyDiscount) {
          applicableDiscount = companyDiscount
          isNegotiated = true
        }
      }

      // Fall back to base discount
      if (!applicableDiscount) {
        const baseDiscount = merchantDiscounts.find(d => d.type === DiscountType.BASE)
        if (baseDiscount) {
          applicableDiscount = baseDiscount
        }
      }

      // Skip if no applicable discount found
      if (!applicableDiscount) {
        continue
      }

      // Get primary location
      const primaryLocation = merchant.locations?.[0]

      // Calculate distance if coordinates provided
      let distance: number | undefined
      if (lat && lng && primaryLocation?.coordinates?.lat && primaryLocation?.coordinates?.lng) {
        distance = calculateDistance(
          parseFloat(lat),
          parseFloat(lng),
          primaryLocation.coordinates.lat,
          primaryLocation.coordinates.lng
        )
      }

      merchantsWithDiscounts.push({
        id: merchant._id.toString(),
        businessName: merchant.businessName,
        logo: merchant.logo,
        description: merchant.description,
        address: {
          city: primaryLocation?.city || '',
          state: primaryLocation?.state || '',
        },
        distance,
        discount: {
          id: applicableDiscount._id.toString(),
          type: applicableDiscount.type,
          name: applicableDiscount.name,
          percentage: applicableDiscount.percentage,
          isNegotiated,
          monthlyUsageLimit: applicableDiscount.monthlyUsageLimit,
        },
        hasClaimed: claimedSet.has(merchant._id.toString()),
      })
    }

    // Sort: by distance if available, otherwise alphabetically
    merchantsWithDiscounts.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance
      }
      return a.businessName.localeCompare(b.businessName)
    })

    return NextResponse.json({
      success: true,
      merchants: merchantsWithDiscounts,
      companyName,
    })
  } catch (error) {
    console.error('Employee merchants API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Haversine formula to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // Round to 1 decimal place
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}
