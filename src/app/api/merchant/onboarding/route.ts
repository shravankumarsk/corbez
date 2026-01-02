import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Merchant, PriceTier, SeatingCapacity, PeakHours } from '@/lib/db/models/merchant.model'
import {
  basicInfoSchema,
  locationSchema,
  businessMetricsSchema,
  onboardingCompleteWithTermsSchema,
} from '@/lib/validations/merchant.schema'

// GET - Check onboarding status
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

    const merchant = await Merchant.findOne({ userId: session.user.id })

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant not found' },
        { status: 404 }
      )
    }

    // Determine current step based on what's filled
    let currentStep = 1
    if (merchant.businessName && merchant.categories?.length > 0) {
      currentStep = 2
    }
    if (merchant.locations?.length > 0) {
      currentStep = 3
    }

    return NextResponse.json({
      success: true,
      needsOnboarding: !merchant.onboardingCompleted,
      currentStep,
      merchant: {
        _id: merchant._id,
        businessName: merchant.businessName,
        description: merchant.description,
        categories: merchant.categories,
        locations: merchant.locations,
        businessMetrics: merchant.businessMetrics,
        onboardingCompleted: merchant.onboardingCompleted,
      },
    })
  } catch (error) {
    console.error('Failed to check onboarding status:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check onboarding status' },
      { status: 500 }
    )
  }
}

// PUT - Save step progress
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { step, data } = body

    await connectDB()

    const merchant = await Merchant.findOne({ userId: session.user.id })

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant not found' },
        { status: 404 }
      )
    }

    // Validate and update based on step
    if (step === '1' || step === 1) {
      const validated = basicInfoSchema.parse(data)

      // Generate slug from business name
      const slug = validated.businessName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      merchant.businessName = validated.businessName
      merchant.description = validated.description || ''
      merchant.categories = validated.categories
      merchant.slug = slug
    } else if (step === '2' || step === 2) {
      const validated = locationSchema.parse(data)

      // Set as first location or update existing
      if (merchant.locations.length === 0) {
        merchant.locations = [{
          address: validated.address,
          city: validated.city,
          state: validated.state,
          zipCode: validated.zipCode,
          country: 'US',
          phone: validated.phone,
        }]
      } else {
        merchant.locations[0] = {
          ...merchant.locations[0],
          address: validated.address,
          city: validated.city,
          state: validated.state,
          zipCode: validated.zipCode,
          phone: validated.phone,
        }
      }
    } else if (step === '3' || step === 3) {
      const validated = businessMetricsSchema.parse(data)

      merchant.businessMetrics = {
        avgOrderValue: validated.avgOrderValue,
        priceTier: validated.priceTier as PriceTier,
        seatingCapacity: validated.seatingCapacity as SeatingCapacity,
        seatingCapacityNumeric: validated.seatingCapacityNumeric,
        peakHours: validated.peakHours as PeakHours[],
        cateringAvailable: validated.cateringAvailable,
        offersDelivery: validated.offersDelivery,
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid step' },
        { status: 400 }
      )
    }

    await merchant.save()

    return NextResponse.json({
      success: true,
      message: `Step ${step} saved successfully`,
    })
  } catch (error) {
    console.error('Failed to save onboarding step:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to save onboarding step' },
      { status: 500 }
    )
  }
}

// POST - Complete onboarding
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    await connectDB()

    const merchant = await Merchant.findOne({ userId: session.user.id })

    if (!merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant not found' },
        { status: 404 }
      )
    }

    // Validate complete onboarding data (including security terms)
    const validated = onboardingCompleteWithTermsSchema.parse(body)

    // Generate slug from business name
    const slug = validated.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Update all fields
    merchant.businessName = validated.businessName
    merchant.description = validated.description || ''
    merchant.categories = validated.categories
    merchant.slug = slug

    merchant.locations = [{
      address: validated.address,
      city: validated.city,
      state: validated.state,
      zipCode: validated.zipCode,
      country: 'US',
      phone: validated.phone,
    }]

    merchant.businessMetrics = {
      avgOrderValue: validated.avgOrderValue,
      priceTier: validated.priceTier as PriceTier,
      seatingCapacity: validated.seatingCapacity as SeatingCapacity,
      seatingCapacityNumeric: validated.seatingCapacityNumeric,
      peakHours: validated.peakHours as PeakHours[],
      cateringAvailable: validated.cateringAvailable,
      offersDelivery: validated.offersDelivery,
    }

    // SECURITY: Save security terms acceptance
    merchant.securityTermsAccepted = validated.securityTermsAccepted
    merchant.securityTermsAcceptedAt = new Date()
    merchant.securityTermsVersion = validated.securityTermsVersion

    merchant.onboardingCompleted = true
    merchant.onboardingCompletedAt = new Date()

    await merchant.save()

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
    })
  } catch (error) {
    console.error('Failed to complete onboarding:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}
