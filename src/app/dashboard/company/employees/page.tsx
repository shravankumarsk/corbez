'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Employee {
  _id: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  department?: string
  jobTitle?: string
  status: string
  joinedAt?: string
  createdAt: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (search) params.set('search', search)

      const response = await fetch(`/api/company/employees?${params}`)
      const data = await response.json()

      if (data.success) {
        setEmployees(data.employees)
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchEmployees()
  }

  const handleStatusChange = async (employeeId: string, newStatus: string) => {
    setActionLoading(employeeId)
    setMessage(null)

    try {
      const response = await fetch(`/api/company/employees/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Employee status updated' })
        fetchEmployees()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update employee' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (employeeId: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the company?`)) return

    setActionLoading(employeeId)
    setMessage(null)

    try {
      const response = await fetch(`/api/company/employees/${employeeId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Employee removed' })
        fetchEmployees()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to remove' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove employee' })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || styles.PENDING}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-1">Manage company employees and their access</p>
        </div>
        <Link href="/dashboard/company">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Filters */}
      <Card variant="bordered" className="mb-6">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {employees.length} Employee{employees.length !== 1 ? 's' : ''}
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <p>No employees found</p>
              <p className="text-sm mt-1">Generate invite codes to add employees</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <div key={employee._id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {employee.firstName.charAt(0)}
                        {employee.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">
                          {employee.firstName} {employee.lastName}
                        </p>
                        {getStatusBadge(employee.status)}
                        {employee.emailVerified && (
                          <span title="Email Verified">
                            <svg
                              className="w-4 h-4 text-blue-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                      {(employee.department || employee.jobTitle) && (
                        <p className="text-xs text-gray-400">
                          {[employee.jobTitle, employee.department].filter(Boolean).join(' • ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {employee.status === 'ACTIVE' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(employee._id, 'INACTIVE')}
                        disabled={actionLoading === employee._id}
                      >
                        Deactivate
                      </Button>
                    ) : employee.status === 'INACTIVE' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(employee._id, 'ACTIVE')}
                        disabled={actionLoading === employee._id}
                      >
                        Activate
                      </Button>
                    ) : null}
                    <button
                      onClick={() =>
                        handleRemove(employee._id, `${employee.firstName} ${employee.lastName}`)
                      }
                      disabled={actionLoading === employee._id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
