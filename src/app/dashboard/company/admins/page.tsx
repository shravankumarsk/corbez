'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Admin {
  _id: string
  email: string
  name?: string
  role: string
  title?: string
  status: string
  permissions: {
    manageEmployees: boolean
    manageInvites: boolean
    manageAdmins: boolean
    viewReports: boolean
  }
  createdAt: string
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    role: 'HR',
    title: '',
  })

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/company/admins')
      const data = await response.json()

      if (data.success) {
        setAdmins(data.admins)
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/company/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Admin added successfully' })
        setShowForm(false)
        setFormData({ email: '', role: 'HR', title: '' })
        fetchAdmins()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to add admin' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to add admin' })
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (adminId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove ${email} as an admin?`)) return

    try {
      const response = await fetch(`/api/company/admins/${adminId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Admin removed' })
        fetchAdmins()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to remove' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to remove admin' })
    }
  }

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      OWNER: 'bg-purple-100 text-purple-800',
      HR: 'bg-blue-100 text-blue-800',
      CONTACT: 'bg-gray-100 text-gray-800',
    }
    const labels: Record<string, string> = {
      OWNER: 'Owner',
      HR: 'HR Admin',
      CONTACT: 'Contact',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[role] || styles.CONTACT}`}>
        {labels[role] || role}
      </span>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Admins</h1>
          <p className="text-gray-600 mt-1">Manage HR and other administrators</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/company">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          {!showForm && (
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Add Admin
            </Button>
          )}
        </div>
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

      {/* Add Admin Form */}
      {showForm && (
        <Card variant="bordered" className="mb-6">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Add New Admin</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@company.com"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  The user must have a Corbe account
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="HR">HR Admin</option>
                  <option value="CONTACT">Contact (View Only)</option>
                  <option value="OWNER">Owner (Full Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title (Optional)
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., HR Director, Benefits Coordinator"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" isLoading={saving}>
                  Add Admin
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Role Descriptions */}
      <Card variant="bordered" className="mb-6">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Admin Roles</h2>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getRoleBadge('OWNER')}
              </div>
              <p className="text-sm text-gray-700">
                Full access to everything including adding/removing other admins
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getRoleBadge('HR')}
              </div>
              <p className="text-sm text-gray-700">
                Can manage employees and generate invite codes
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {getRoleBadge('CONTACT')}
              </div>
              <p className="text-sm text-gray-700">
                View-only access, main point of contact for communications
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin List */}
      <Card variant="bordered">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            {admins.length} Admin{admins.length !== 1 ? 's' : ''}
          </h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No admins found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <div key={admin._id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {admin.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900">{admin.email}</p>
                        {getRoleBadge(admin.role)}
                      </div>
                      {admin.title && (
                        <p className="text-sm text-gray-500">{admin.title}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-xs text-gray-400">
                      <div className="flex gap-2">
                        {admin.permissions.manageEmployees && (
                          <span title="Can manage employees">Employees</span>
                        )}
                        {admin.permissions.manageInvites && (
                          <span title="Can manage invites">Invites</span>
                        )}
                        {admin.permissions.manageAdmins && (
                          <span title="Can manage admins">Admins</span>
                        )}
                      </div>
                    </div>
                    {admin.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemove(admin._id, admin.email)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove admin"
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
                    )}
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
