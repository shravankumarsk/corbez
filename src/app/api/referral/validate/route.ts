import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db/mongoose'
import { User } from '@/lib/db/models/user.model'
import { Employee } from '@/lib/db/models/employee.model'
import { Company } from '@/lib/db/models/company.model'

// GET - Validate a referral code and return referrer info
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')

    if (!code) {
      return NextResponse.json({ success: false, error: 'Code required' }, { status: 400 })
    }

    await connectDB()

    // Find user with this referral code
    const referrer = await User.findOne({ referralCode: code })

    if (!referrer) {
      return NextResponse.json({ success: false, error: 'Invalid referral code' }, { status: 404 })
    }

    // Get referrer's company info if they're an employee
    let companyName = null
    const employee = await Employee.findOne({ userId: referrer._id })
    if (employee?.companyId) {
      const company = await Company.findById(employee.companyId)
      if (company) {
        companyName = company.name
      }
    }

    const referrerName = referrer.firstName
      ? `${referrer.firstName} ${referrer.lastName || ''}`.trim()
      : referrer.email.split('@')[0]

    return NextResponse.json({
      success: true,
      referrer: {
        name: referrerName,
        companyName,
      },
    })
  } catch (error) {
    console.error('Referral validation error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
