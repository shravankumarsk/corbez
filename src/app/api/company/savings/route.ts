import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { CompanyAdmin } from '@/lib/db/models/company-admin.model'
import { Employee } from '@/lib/db/models/employee.model'
import { Merchant, MerchantStatus } from '@/lib/db/models/merchant.model'
import { Discount, DiscountType } from '@/lib/db/models/discount.model'
import { calculatePotentialSavings } from '@/lib/services/savings/calculate'

interface MerchantSavings {
  _id: string
  businessName: string
  logo?: string
  avgOrderValue: number
  discountPercentage: number
  potentialMonthlySavings: number
  perEmployeeSavings: number
  perVisitSavings: number
}

// GET - Get savings calculations for all merchants with discounts
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await connectDB()

    // Get the company admin's company
    const companyAdmin = await CompanyAdmin.findOne({
      userId: session.user.id,
      status: 'ACTIVE',
    })

    if (!companyAdmin) {
      return NextResponse.json(
        { success: false, error: 'Company admin not found' },
        { status: 404 }
      )
    }

    // Get employee count for this company
    const employeeCount = await Employee.countDocuments({
      companyId: companyAdmin.companyId,
      status: 'ACTIVE',
    })

    // Get all active merchants with business metrics
    const merchants = await Merchant.find({
      status: MerchantStatus.ACTIVE,
      onboardingCompleted: true,
      'businessMetrics.avgOrderValue': { $exists: true, $gt: 0 },
    }).select('_id businessName logo businessMetrics')

    // Get discounts for these merchants
    const merchantIds = merchants.map((m) => m._id)
    const discounts = await Discount.find({
      merchantId: { $in: merchantIds },
      isActive: true,
      type: { $in: [DiscountType.BASE, DiscountType.COMPANY] },
    })

    // Build a map of merchantId -> best discount percentage
    const discountMap = new Map<string, number>()

    for (const discount of discounts) {
      const merchantIdStr = discount.merchantId.toString()
      const currentBest = discountMap.get(merchantIdStr) || 0

      // Check if this is a company-specific discount for our company
      if (discount.type === DiscountType.COMPANY) {
        if (discount.companyId?.toString() === companyAdmin.companyId.toString()) {
          // Company-specific discount takes priority
          discountMap.set(merchantIdStr, Math.max(discount.percentage, currentBest))
        }
      } else if (discount.type === DiscountType.BASE) {
        // Only use base if no company-specific discount
        if (!discountMap.has(merchantIdStr) || currentBest === 0) {
          discountMap.set(merchantIdStr, discount.percentage)
        }
      }
    }

    // Calculate savings for each merchant
    const merchantSavings: MerchantSavings[] = []
    let totalPotentialMonthlySavings = 0

    for (const merchant of merchants) {
      const discountPercentage = discountMap.get(merchant._id.toString())

      if (!discountPercentage || !merchant.businessMetrics?.avgOrderValue) {
        continue
      }

      const savings = calculatePotentialSavings({
        avgOrderValue: merchant.businessMetrics.avgOrderValue,
        discountPercentage,
        employeeCount,
        estimatedMonthlyVisits: 2,
      })

      merchantSavings.push({
        _id: merchant._id.toString(),
        businessName: merchant.businessName,
        logo: merchant.logo,
        avgOrderValue: merchant.businessMetrics.avgOrderValue,
        discountPercentage,
        potentialMonthlySavings: savings.monthlyTotal,
        perEmployeeSavings: savings.perEmployee,
        perVisitSavings: savings.perVisit,
      })

      totalPotentialMonthlySavings += savings.monthlyTotal
    }

    // Sort by potential savings (highest first)
    merchantSavings.sort((a, b) => b.potentialMonthlySavings - a.potentialMonthlySavings)

    return NextResponse.json({
      success: true,
      employeeCount,
      merchants: merchantSavings,
      totalPotentialMonthlySavings: Math.round(totalPotentialMonthlySavings * 100) / 100,
      totalPotentialAnnualSavings: Math.round(totalPotentialMonthlySavings * 12 * 100) / 100,
    })
  } catch (error) {
    console.error('Failed to calculate savings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to calculate savings' },
      { status: 500 }
    )
  }
}
