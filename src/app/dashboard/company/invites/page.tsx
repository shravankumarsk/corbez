'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Invite {
  _id: string
  code: string
  email?: string
  status: string
  createdBy: string
  usedBy?: string
  expiresAt: string
  usedAt?: string
  createdAt: string
}

interface ParsedCSVRow {
  email: string
  name?: string
  department?: string
}

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'bulk' | 'email' | 'csv'>('bulk')
  const [bulkCount, setBulkCount] = useState('5')
  const [emails, setEmails] = useState('')
  const [expiresInDays, setExpiresInDays] = useState('30')
  const [sendEmails, setSendEmails] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)

  // CSV import state
  const [csvData, setCsvData] = useState<ParsedCSVRow[]>([])
  const [csvFileName, setCsvFileName] = useState<string | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (content: string): ParsedCSVRow[] => {
    const lines = content.split(/\r?\n/).filter((line) => line.trim())
    if (lines.length === 0) return []

    // Check if first line is a header
    const firstLine = lines[0].toLowerCase()
    const hasHeader = firstLine.includes('email') || firstLine.includes('name') || firstLine.includes('department')
    const startIndex = hasHeader ? 1 : 0

    const results: ParsedCSVRow[] = []
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // Handle both comma and semicolon delimiters, and quoted values
      const values = line.match(/("([^"]*)")|([^,;\t]+)/g)?.map((v) => v.replace(/^"|"$/g, '').trim()) || []

      // Find the email in the row (could be any column)
      let email = ''
      let name = ''
      let department = ''

      for (const value of values) {
        if (emailRegex.test(value)) {
          email = value.toLowerCase()
        } else if (!name && value.length > 0) {
          name = value
        } else if (name && !department && value.length > 0) {
          department = value
        }
      }

      if (email) {
        results.push({ email, name: name || undefined, department: department || undefined })
      }
    }

    return results
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setCsvError(null)
    setCsvData([])
    setCsvFileName(null)

    if (!file) return

    if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
      setCsvError('Please upload a CSV file')
      return
    }

    if (file.size > 1024 * 1024) {
      setCsvError('File size must be less than 1MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      const parsed = parseCSV(content)

      if (parsed.length === 0) {
        setCsvError('No valid email addresses found in the CSV')
        return
      }

      setCsvData(parsed)
      setCsvFileName(file.name)
    }
    reader.onerror = () => {
      setCsvError('Failed to read file')
    }
    reader.readAsText(file)
  }

  const clearCSV = () => {
    setCsvData([])
    setCsvFileName(null)
    setCsvError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const downloadSampleCSV = () => {
    const sampleData = `email,name,department
john.doe@company.com,John Doe,Engineering
jane.smith@company.com,Jane Smith,Marketing
bob.wilson@company.com,Bob Wilson,Sales
alice.johnson@company.com,Alice Johnson,Human Resources
mike.brown@company.com,Mike Brown,Finance`

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'employee_invite_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const fetchInvites = async () => {
    try {
      const response = await fetch('/api/company/invites')
      const data = await response.json()

      if (data.success) {
        setInvites(data.invites)
      }
    } catch (error) {
      console.error('Failed to fetch invites:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvites()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setMessage(null)

    try {
      const payload: Record<string, unknown> = {
        expiresInDays: parseInt(expiresInDays),
      }

      if (formType === 'bulk') {
        payload.count = parseInt(bulkCount)
      } else if (formType === 'email') {
        const emailList = emails
          .split(/[,\n]/)
          .map((e) => e.trim())
          .filter((e) => e && e.includes('@'))
        payload.emails = emailList
        payload.sendEmails = sendEmails
      } else if (formType === 'csv') {
        if (csvData.length === 0) {
          setMessage({ type: 'error', text: 'Please upload a CSV file first' })
          setCreating(false)
          return
        }
        payload.emails = csvData.map((row) => row.email)
        payload.sendEmails = sendEmails
      }

      const response = await fetch('/api/company/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message })
        setShowForm(false)
        setBulkCount('5')
        setEmails('')
        clearCSV()
        fetchInvites()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create invites' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create invites' })
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async (inviteId: string) => {
    if (!confirm('Are you sure you want to revoke this invite?')) return

    try {
      const response = await fetch(`/api/company/invites/${inviteId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: 'Invite revoked' })
        fetchInvites()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to revoke' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to revoke invite' })
    }
  }

  const handleResend = async (inviteId: string, email: string) => {
    setResendingId(inviteId)
    setMessage(null)

    try {
      const response = await fetch(`/api/company/invites/${inviteId}`, {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: `Invitation email resent to ${email}` })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to resend' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to resend invite' })
    } finally {
      setResendingId(null)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      USED: 'bg-blue-100 text-blue-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      REVOKED: 'bg-red-100 text-red-800',
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[status] || styles.ACTIVE}`}>
        {status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const activeInvites = invites.filter((i) => i.status === 'ACTIVE')
  const usedInvites = invites.filter((i) => i.status === 'USED')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invite Codes</h1>
          <p className="text-gray-600 mt-1">Generate codes for employees to join your company</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/company">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          {!showForm && (
            <Button variant="primary" onClick={() => setShowForm(true)}>
              Generate Codes
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

      {/* Create Form */}
      {showForm && (
        <Card variant="bordered" className="mb-6">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Generate Invite Codes</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Type Selection */}
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setFormType('bulk')}
                  className={`flex-1 p-3 rounded-lg border-2 text-center transition-colors ${
                    formType === 'bulk'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">Bulk Generate</div>
                  <div className="text-xs text-gray-500">Create multiple codes</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('email')}
                  className={`flex-1 p-3 rounded-lg border-2 text-center transition-colors ${
                    formType === 'email'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">By Email</div>
                  <div className="text-xs text-gray-500">Enter emails manually</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormType('csv')}
                  className={`flex-1 p-3 rounded-lg border-2 text-center transition-colors ${
                    formType === 'csv'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">CSV Import</div>
                  <div className="text-xs text-gray-500">Upload from file</div>
                </button>
              </div>

              {formType === 'bulk' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Codes
                  </label>
                  <Input
                    type="number"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(e.target.value)}
                    min="1"
                    max="100"
                    required
                  />
                </div>
              )}

              {formType === 'email' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Addresses
                    </label>
                    <textarea
                      value={emails}
                      onChange={(e) => setEmails(e.target.value)}
                      placeholder="Enter email addresses, one per line or comma-separated"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Each email will receive a unique invite code
                    </p>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="sendEmails"
                      checked={sendEmails}
                      onChange={(e) => setSendEmails(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="sendEmails" className="flex-1">
                      <span className="font-medium text-gray-900">Send invitation emails</span>
                      <p className="text-xs text-gray-600">
                        Automatically email each person their invite code with a link to register
                      </p>
                    </label>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </>
              )}

              {formType === 'csv' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload CSV File
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        csvFileName
                          ? 'border-green-300 bg-green-50'
                          : csvError
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                        id="csvUpload"
                      />

                      {csvFileName ? (
                        <div className="space-y-2">
                          <svg className="w-10 h-10 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="font-medium text-gray-900">{csvFileName}</p>
                          <p className="text-sm text-green-600">
                            {csvData.length} email{csvData.length !== 1 ? 's' : ''} found
                          </p>
                          <button
                            type="button"
                            onClick={clearCSV}
                            className="text-sm text-red-600 hover:text-red-700 underline"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <label htmlFor="csvUpload" className="cursor-pointer">
                          <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">
                            <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span>
                            {' '}or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 mt-1">CSV file up to 1MB</p>
                        </label>
                      )}
                    </div>

                    {csvError && (
                      <p className="mt-2 text-sm text-red-600">{csvError}</p>
                    )}

                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-gray-700 mb-1">CSV Format:</p>
                          <p>Your CSV should contain email addresses. Optional columns: name, department</p>
                          <p className="mt-1 font-mono text-gray-500">
                            email,name,department<br />
                            john@company.com,John Doe,Engineering<br />
                            jane@company.com,Jane Smith,Marketing
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={downloadSampleCSV}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Template
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Preview parsed emails */}
                  {csvData.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-700">
                          Preview ({csvData.length} email{csvData.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-gray-100">
                            {csvData.slice(0, 10).map((row, i) => (
                              <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-900">{row.email}</td>
                                <td className="px-4 py-2 text-gray-500">{row.name || '-'}</td>
                                <td className="px-4 py-2 text-gray-500">{row.department || '-'}</td>
                              </tr>
                            ))}
                            {csvData.length > 10 && (
                              <tr>
                                <td colSpan={3} className="px-4 py-2 text-center text-gray-500">
                                  ...and {csvData.length - 10} more
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="sendEmailsCsv"
                      checked={sendEmails}
                      onChange={(e) => setSendEmails(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="sendEmailsCsv" className="flex-1">
                      <span className="font-medium text-gray-900">Send invitation emails</span>
                      <p className="text-xs text-gray-600">
                        Automatically email each person their invite code with a link to register
                      </p>
                    </label>
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires In (days)
                </label>
                <Input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  min="1"
                  max="365"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" isLoading={creating}>
                  Generate
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card variant="bordered">
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-green-600">{activeInvites.length}</p>
            <p className="text-sm text-gray-600">Active Codes</p>
          </CardContent>
        </Card>
        <Card variant="bordered">
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{usedInvites.length}</p>
            <p className="text-sm text-gray-600">Used Codes</p>
          </CardContent>
        </Card>
      </div>

      {/* Invite List */}
      <Card variant="bordered">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">All Invite Codes</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : invites.length === 0 ? (
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p>No invite codes yet</p>
              <p className="text-sm mt-1">Generate codes to invite employees</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {invites.map((invite) => (
                <div key={invite._id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="font-mono text-lg font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                      {invite.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(invite.status)}
                        {invite.email && (
                          <span className="text-sm text-gray-500">for {invite.email}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {invite.status === 'USED' && invite.usedBy
                          ? `Used by ${invite.usedBy}`
                          : `Expires ${formatDate(invite.expiresAt)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {invite.status === 'ACTIVE' && (
                      <>
                        {invite.email && (
                          <button
                            onClick={() => handleResend(invite._id, invite.email!)}
                            disabled={resendingId === invite._id}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Resend invite email"
                          >
                            {resendingId === invite._id ? (
                              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => copyToClipboard(invite.code)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Copy code"
                        >
                          {copiedCode === invite.code ? (
                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleRevoke(invite._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Revoke"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card variant="bordered" className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">How Invite Codes Work</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">CSV Import (Best for large teams)</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Export employee list from your HR system as CSV</li>
                <li>Upload the file - emails are automatically detected</li>
                <li>Preview and confirm the list</li>
                <li>Enable email invites to notify everyone at once</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Email Invites</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Enter employee email addresses manually</li>
                <li>Enable &quot;Send invitation emails&quot;</li>
                <li>Employees receive an email with their invite code and sign-up link</li>
                <li>They click the link and are automatically added to your company</li>
              </ol>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Bulk Codes</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                <li>Generate multiple generic codes</li>
                <li>Share codes via Slack, internal portal, or printed materials</li>
                <li>Employees enter the code during registration</li>
                <li>Anyone with a valid code can join your company</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
