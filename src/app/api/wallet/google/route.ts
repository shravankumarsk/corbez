import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Employee } from '@/lib/db/models/employee.model'
import { Company } from '@/lib/db/models/company.model'
import {
  generateGoogleWalletUrl,
  isGoogleWalletConfigured,
  getGoogleWalletPreviewData,
} from '@/lib/services/wallet/google-wallet'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check if email is verified
    if (!session.user.isEmailVerified) {
      return NextResponse.json(
        { success: false, error: 'Please verify your email first' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get employee details
    const employee = await Employee.findOne({ userId: session.user.id })

    let employeeName = session.user.email?.split('@')[0] || 'Employee'
    let companyName = 'Unknown Company'

    if (employee) {
      employeeName = `${employee.firstName} ${employee.lastName}`

      if (employee.companyId) {
        const company = await Company.findById(employee.companyId)
        if (company) {
          companyName = company.name
        }
      }
    }

    // Extract company from email domain as fallback
    if (companyName === 'Unknown Company' && session.user.email) {
      const domain = session.user.email.split('@')[1]
      if (domain) {
        companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1)
      }
    }

    const passData = {
      odId: session.user.id,
      odName: employeeName,
      email: session.user.email || '',
      companyName,
      odStatus: 'verified' as const,
    }

    // Check if Google Wallet is configured
    if (!isGoogleWalletConfigured()) {
      return NextResponse.json({
        success: false,
        configured: false,
        preview: getGoogleWalletPreviewData(passData),
        message: 'Google Wallet not configured. Showing preview only.',
      })
    }

    // Generate the save URL
    const result = await generateGoogleWalletUrl(passData)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate wallet URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      saveUrl: result.saveUrl,
    })
  } catch (error) {
    console.error('Google Wallet error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate wallet pass' },
      { status: 500 }
    )
  }
}
