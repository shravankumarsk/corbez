import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Employee } from '@/lib/db/models/employee.model'
import { User } from '@/lib/db/models/user.model'
import { CompanyAdmin } from '@/lib/db/models/company-admin.model'

// GET - List all employees for the company
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    await connectDB()

    // Check if user is a company admin with permission
    const adminRecord = await CompanyAdmin.findOne({
      userId: session.user.id,
      status: 'ACTIVE',
    })

    if (!adminRecord) {
      return NextResponse.json(
        { success: false, error: 'Not a company admin' },
        { status: 403 }
      )
    }

    // Build query
    const query: Record<string, unknown> = { companyId: adminRecord.companyId }

    if (status !== 'all') {
      query.status = status.toUpperCase()
    }

    // Get employees
    const employees = await Employee.find(query)
      .populate('userId', 'email emailVerified')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Filter by search if provided
    let filteredEmployees = employees
    if (search) {
      const searchLower = search.toLowerCase()
      filteredEmployees = employees.filter((emp: any) => {
        const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase()
        const email = emp.userId?.email?.toLowerCase() || ''
        return fullName.includes(searchLower) || email.includes(searchLower)
      })
    }

    // Get total count
    const total = await Employee.countDocuments(query)

    // Format response
    const formattedEmployees = filteredEmployees.map((emp: any) => ({
      _id: emp._id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.userId?.email,
      emailVerified: emp.userId?.emailVerified,
      department: emp.department,
      jobTitle: emp.jobTitle,
      status: emp.status,
      joinedAt: emp.joinedAt,
      createdAt: emp.createdAt,
    }))

    return NextResponse.json({
      success: true,
      employees: formattedEmployees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch employees:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch employees' },
      { status: 500 }
    )
  }
}
