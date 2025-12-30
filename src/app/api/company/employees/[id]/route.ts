import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { connectDB } from '@/lib/db/mongoose'
import { Employee, EmployeeStatus } from '@/lib/db/models/employee.model'
import { CompanyAdmin } from '@/lib/db/models/company-admin.model'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT - Update employee status (activate/deactivate)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    // Validate status
    if (!Object.values(EmployeeStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    await connectDB()

    // Check if user is a company admin with employee management permission
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

    if (!adminRecord.permissions.manageEmployees) {
      return NextResponse.json(
        { success: false, error: 'No permission to manage employees' },
        { status: 403 }
      )
    }

    // Find and update employee
    const employee = await Employee.findOne({
      _id: id,
      companyId: adminRecord.companyId,
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    employee.status = status
    await employee.save()

    return NextResponse.json({
      success: true,
      employee: {
        _id: employee._id,
        status: employee.status,
      },
    })
  } catch (error) {
    console.error('Failed to update employee:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update employee' },
      { status: 500 }
    )
  }
}

// DELETE - Remove employee from company
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    await connectDB()

    // Check if user is a company admin with employee management permission
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

    if (!adminRecord.permissions.manageEmployees) {
      return NextResponse.json(
        { success: false, error: 'No permission to manage employees' },
        { status: 403 }
      )
    }

    // Find and delete employee
    const employee = await Employee.findOneAndDelete({
      _id: id,
      companyId: adminRecord.companyId,
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Employee removed successfully',
    })
  } catch (error) {
    console.error('Failed to delete employee:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete employee' },
      { status: 500 }
    )
  }
}
