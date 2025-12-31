import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { Company } from '@/lib/db/models/company.model'

/**
 * Smart Company Detection API
 * Suggests companies based on email domain to reduce onboarding friction
 *
 * GET /api/company/suggest-by-email?email=john@acme.com
 * Returns matching company if email domain matches
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ message: 'Email parameter required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }

    // Extract domain from email
    const emailDomain = email.toLowerCase().split('@')[1]

    // Common free email domains - don't suggest companies for these
    const freeEmailDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
      'aol.com',
      'mail.com',
      'protonmail.com',
      'zoho.com',
    ]

    if (freeEmailDomains.includes(emailDomain)) {
      return NextResponse.json({
        success: true,
        suggested: false,
        message: 'Personal email domain detected',
      })
    }

    await connectDB()

    // Find company with matching email domain
    const matchingCompany = await Company.findOne({
      'settings.emailDomain': emailDomain,
      status: { $in: ['ACTIVE', 'PENDING'] }, // Don't suggest suspended companies
    }).select('name slug logo settings.autoApproveEmployees status')

    if (!matchingCompany) {
      return NextResponse.json({
        success: true,
        suggested: false,
        message: 'No matching company found',
      })
    }

    // Return company suggestion
    return NextResponse.json({
      success: true,
      suggested: true,
      company: {
        id: matchingCompany._id,
        name: matchingCompany.name,
        slug: matchingCompany.slug,
        logo: matchingCompany.logo,
        autoApprove: matchingCompany.settings.autoApproveEmployees,
        status: matchingCompany.status,
      },
      message: matchingCompany.settings.autoApproveEmployees
        ? `Join ${matchingCompany.name} instantly - no invite code needed!`
        : `Work at ${matchingCompany.name}? Request to join`,
    })
  } catch (error) {
    console.error('Company suggestion error:', error)
    return NextResponse.json(
      { message: 'Failed to suggest company', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
