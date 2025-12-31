'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Discount {
  _id: string
  type: 'BASE' | 'COMPANY' | 'SPEND_THRESHOLD' | 'COMPANY_PERK'
  name: string
  percentage: number
  companyName?: string
  minSpend?: number
  perkItem?: string
  perkValue?: number
  perkDescription?: string
  perkRestrictions?: string
  monthlyUsageLimit?: number | null
  isActive: boolean
}

type DiscountFormData = {
  type: 'BASE' | 'COMPANY' | 'SPEND_THRESHOLD' | 'COMPANY_PERK'
  name: string
  percentage: string
  companyName: string
  minSpend: string
  perkItem: string
  perkValue: string
  perkDescription: string
  perkRestrictions: string
  monthlyUsageLimit: string
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<DiscountFormData>({
    type: 'BASE',
    name: '',
    percentage: '',
    companyName: '',
    minSpend: '',
    perkItem: '',
    perkValue: '',
    perkDescription: '',
    perkRestrictions: '',
    monthlyUsageLimit: '',
  })

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/merchant/discounts')
      const data = await response.json()

      if (data.success) {
        setDiscounts(data.discounts)
      }
    } catch (err) {
      console.error('Failed to fetch discounts:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDiscounts()
  }, [])

  const resetForm = () => {
    setFormData({
      type: 'BASE',
      name: '',
      percentage: '',
      companyName: '',
      minSpend: '',
      perkItem: '',
      perkValue: '',
      perkDescription: '',
      perkRestrictions: '',
      monthlyUsageLimit: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const payload = {
        type: formData.type,
        name: formData.name,
        percentage: formData.type === 'COMPANY_PERK' ? 0 : parseFloat(formData.percentage),
        ...(formData.type === 'COMPANY' && { companyName: formData.companyName }),
        ...(formData.type === 'SPEND_THRESHOLD' && { minSpend: parseFloat(formData.minSpend) }),
        ...(formData.type === 'COMPANY_PERK' && {
          companyName: formData.companyName,
          perkItem: formData.perkItem,
          perkValue: formData.perkValue ? parseFloat(formData.perkValue) : undefined,
          perkDescription: formData.perkDescription || undefined,
          perkRestrictions: formData.perkRestrictions || undefined,
        }),
        monthlyUsageLimit: formData.monthlyUsageLimit ? parseInt(formData.monthlyUsageLimit, 10) : null,
      }

      const url = editingId
        ? `/api/merchant/discounts/${editingId}`
        : '/api/merchant/discounts'

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(editingId ? 'Discount updated successfully!' : 'Discount created successfully!')
        resetForm()
        fetchDiscounts()
      } else {
        setError(data.error || 'Failed to save discount')
      }
    } catch (err) {
      setError('Failed to save discount. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (discount: Discount) => {
    setFormData({
      type: discount.type,
      name: discount.name,
      percentage: discount.percentage.toString(),
      companyName: discount.companyName || '',
      minSpend: discount.minSpend?.toString() || '',
      perkItem: discount.perkItem || '',
      perkValue: discount.perkValue?.toString() || '',
      perkDescription: discount.perkDescription || '',
      perkRestrictions: discount.perkRestrictions || '',
      monthlyUsageLimit: discount.monthlyUsageLimit?.toString() || '',
    })
    setEditingId(discount._id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this discount?')) return

    try {
      const response = await fetch(`/api/merchant/discounts/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Discount deleted successfully!')
        fetchDiscounts()
      } else {
        setError(data.error || 'Failed to delete discount')
      }
    } catch (err) {
      setError('Failed to delete discount. Please try again.')
    }
  }

  const handleToggleActive = async (discount: Discount) => {
    try {
      const response = await fetch(`/api/merchant/discounts/${discount._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !discount.isActive }),
      })

      const data = await response.json()

      if (data.success) {
        fetchDiscounts()
      } else {
        setError(data.error || 'Failed to update discount')
      }
    } catch (err) {
      setError('Failed to update discount. Please try again.')
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BASE':
        return 'Base Discount'
      case 'COMPANY':
        return 'Company Discount'
      case 'SPEND_THRESHOLD':
        return 'Spend Threshold'
      case 'COMPANY_PERK':
        return 'Company Perk'
      default:
        return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'BASE':
        return 'bg-blue-100 text-blue-800'
      case 'COMPANY':
        return 'bg-purple-100 text-purple-800'
      case 'SPEND_THRESHOLD':
        return 'bg-green-100 text-green-800'
      case 'COMPANY_PERK':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const hasBaseDiscount = discounts.some(d => d.type === 'BASE')

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discount Management</h1>
          <p className="text-gray-600 mt-1">Configure discounts for verified corporate employees</p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            Add Discount
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          {success}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card variant="bordered" className="mb-6">
          <CardHeader>
            <h2 className="font-semibold text-gray-900">
              {editingId ? 'Edit Discount' : 'Add New Discount'}
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Discount Type */}
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'BASE' })}
                      disabled={hasBaseDiscount}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        formData.type === 'BASE'
                          ? 'border-blue-500 bg-blue-50'
                          : hasBaseDiscount
                          ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">Base</div>
                      <div className="text-xs text-gray-500">All employees</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'COMPANY' })}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        formData.type === 'COMPANY'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">Company</div>
                      <div className="text-xs text-gray-500">Specific company</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'SPEND_THRESHOLD' })}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        formData.type === 'SPEND_THRESHOLD'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900">Spend</div>
                      <div className="text-xs text-gray-500">Order minimum</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'COMPANY_PERK' })}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        formData.type === 'COMPANY_PERK'
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900 flex items-center justify-center gap-1">
                        <span>Perk</span>
                        <span className="text-orange-500">🎁</span>
                      </div>
                      <div className="text-xs text-gray-500">Free item</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === 'COMPANY_PERK' ? 'Perk Name' : 'Discount Name'}
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={
                    formData.type === 'BASE'
                      ? 'e.g., Standard Employee Discount'
                      : formData.type === 'COMPANY'
                      ? 'e.g., Google Employee Special'
                      : formData.type === 'COMPANY_PERK'
                      ? 'e.g., Google Free Appetizer'
                      : 'e.g., Large Order Bonus'
                  }
                  required
                />
              </div>

              {/* Company Name (for COMPANY and COMPANY_PERK types) */}
              {(formData.type === 'COMPANY' || formData.type === 'COMPANY_PERK') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <Input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="e.g., Google, Microsoft, Apple"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.type === 'COMPANY_PERK'
                      ? 'Employees from this company will receive this free perk'
                      : 'Employees from this company will receive this discount'}
                  </p>
                </div>
              )}

              {/* Min Spend (for SPEND_THRESHOLD type) */}
              {formData.type === 'SPEND_THRESHOLD' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order Amount ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.minSpend}
                    onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                    placeholder="e.g., 50"
                    min="1"
                    step="0.01"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Orders above this amount will receive this discount
                  </p>
                </div>
              )}

              {/* COMPANY_PERK specific fields */}
              {formData.type === 'COMPANY_PERK' && (
                <>
                  {/* Perk Item */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Free Item <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.perkItem}
                      onChange={(e) => setFormData({ ...formData, perkItem: e.target.value })}
                      placeholder="e.g., Free appetizer, Free dessert, Free drink"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      What free item will employees receive? (e.g., appetizer, dessert, drink, side)
                    </p>
                  </div>

                  {/* Perk Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Value ($) <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.perkValue}
                      onChange={(e) => setFormData({ ...formData, perkValue: e.target.value })}
                      placeholder="e.g., 8"
                      min="0"
                      step="0.01"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Estimated cost to you. Helps track perk expenses and ROI.
                    </p>
                  </div>

                  {/* Perk Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Perk Description <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.perkDescription}
                      onChange={(e) => setFormData({ ...formData, perkDescription: e.target.value })}
                      placeholder="e.g., Choose any appetizer from our menu"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Additional details shown to employees about what they can choose
                    </p>
                  </div>

                  {/* Perk Restrictions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Restrictions <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.perkRestrictions}
                      onChange={(e) => setFormData({ ...formData, perkRestrictions: e.target.value })}
                      placeholder="e.g., Dine-in only, Lunch hours 11am-3pm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Time, location, or other restrictions that apply
                    </p>
                  </div>

                  {/* Strategic Nudge for COMPANY_PERK */}
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex gap-3">
                      <span className="text-2xl">💡</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-orange-900 mb-1">Smart Tip: The Perk Strategy</h4>
                        <p className="text-sm text-orange-800">
                          Offering a free $8 appetizer can attract $50+ orders, giving you 500% ROI.
                          Free items create memorable experiences and turn first-timers into regulars.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Percentage (not shown for COMPANY_PERK) */}
              {formData.type !== 'COMPANY_PERK' && (
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Percentage (%)
                </label>
                <Input
                  type="number"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                  placeholder="e.g., 10"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                />
              </div>
              )}

              {/* Monthly Usage Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Usage Limit (optional)
                </label>
                <Input
                  type="number"
                  value={formData.monthlyUsageLimit}
                  onChange={(e) => setFormData({ ...formData, monthlyUsageLimit: e.target.value })}
                  placeholder="Leave empty for unlimited"
                  min="1"
                  max="100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Limit how many times each employee can use this discount per month. Leave empty for unlimited.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" isLoading={saving}>
                  {editingId ? 'Update Discount' : 'Create Discount'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Discounts List */}
      <Card variant="bordered">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Your Discounts</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : discounts.length === 0 ? (
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <p>No discounts configured yet</p>
              <p className="text-sm mt-1">Add a base discount to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {discounts.map((discount) => (
                <div
                  key={discount._id}
                  className={`p-4 border rounded-lg ${
                    discount.isActive ? 'border-gray-200' : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                          discount.type
                        )}`}
                      >
                        {getTypeLabel(discount.type)}
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-900">{discount.name}</h3>
                        <p className="text-sm text-gray-500">
                          {discount.type === 'COMPANY' && `Company: ${discount.companyName}`}
                          {discount.type === 'SPEND_THRESHOLD' &&
                            `Orders over $${discount.minSpend}`}
                          {discount.type === 'BASE' && 'All verified employees'}
                          {discount.type === 'COMPANY_PERK' && (
                            <>
                              Company: {discount.companyName} • {discount.perkItem}
                              {discount.perkDescription && ` (${discount.perkDescription})`}
                            </>
                          )}
                          {discount.monthlyUsageLimit && (
                            <span className="ml-2 text-orange-600">
                              ({discount.monthlyUsageLimit}x/month limit)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {discount.type === 'COMPANY_PERK' ? (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">FREE</div>
                          {discount.perkValue && (
                            <div className="text-xs text-gray-500">(${discount.perkValue} value)</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-gray-900">
                          {discount.percentage}%
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(discount)}
                          className={`p-2 rounded-lg transition-colors ${
                            discount.isActive
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-400 hover:bg-gray-100'
                          }`}
                          title={discount.isActive ? 'Disable' : 'Enable'}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {discount.isActive ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            )}
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(discount)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(discount._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How Discounts Work */}
      <Card variant="bordered" className="mt-6">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">How Discounts Work</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong className="text-gray-900">Priority:</strong> When multiple discounts apply,
              the highest value discount is used (not stacked).
            </p>
            <p>
              <strong className="text-gray-900">Base Discount:</strong> Applies to all verified
              corporate employees. This is your default discount.
            </p>
            <p>
              <strong className="text-gray-900">Company Discount:</strong> Overrides the base
              discount for employees from specific companies.
            </p>
            <p>
              <strong className="text-gray-900">Company Perk:</strong> Offer free items (appetizers,
              desserts, drinks) to employees from specific companies. Great for building partnerships
              and attracting high-value corporate customers.
            </p>
            <p>
              <strong className="text-gray-900">Spend Threshold:</strong> Applies when order
              total exceeds the minimum amount. Takes priority over company and base discounts.
            </p>
            <p>
              <strong className="text-gray-900">Monthly Limit:</strong> Optionally limit how many
              times each employee can use a discount per month. The counter resets on the 1st of each month.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
