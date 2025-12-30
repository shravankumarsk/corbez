'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function EmployeeProfilePage() {
  const { data: session, update } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    personalEmail: '',
    phoneNumber: '',
  })
  const [corbezId, setCorbezId] = useState('')
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined)
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [copied, setCopied] = useState(false)

  // Load current profile data
  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            personalEmail: data.personalEmail || '',
            phoneNumber: data.phoneNumber || '',
          })
          setCorbezId(data.odberCorbezId || '')
          setProfileImage(data.profileImage)
          setPreviewImage(data.profileImage)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' })
      return
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 500KB' })
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setPreviewImage(base64)
      setProfileImage(base64)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setPreviewImage(undefined)
    setProfileImage(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(corbezId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          personalEmail: formData.personalEmail || null,
          phoneNumber: formData.phoneNumber || null,
          profileImage: profileImage || null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' })
        // Update session with new data
        await update({
          firstName: formData.firstName,
          lastName: formData.lastName,
          profileImage: profileImage,
        })
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const initials = formData.firstName && formData.lastName
    ? `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
    : session?.user?.email?.[0]?.toUpperCase() || '?'

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-xl p-6 space-y-4">
            <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      {/* Corbez ID Card */}
      {corbezId && (
        <Card variant="bordered" className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-orange-500 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/80 mb-0.5">Your Corbez ID</p>
                <p className="text-2xl font-mono font-bold tracking-wider">{corbezId}</p>
                <p className="text-xs text-white/70 mt-1">Portable ID - stays with you forever</p>
              </div>
              <button
                onClick={handleCopyId}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                title="Copy ID"
              >
                {copied ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </Card>
      )}

      <Card variant="bordered">
        <CardContent className="py-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Image */}
            <div className="flex items-center gap-4">
              <div className="relative">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Profile"
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-gray-100">
                    <span className="text-primary text-xl font-bold">{initials}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                  Upload photo
                </button>
                {previewImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="ml-3 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove
                  </button>
                )}
                <p className="text-xs text-gray-500 mt-0.5">Max 500KB</p>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Work Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Email
              </label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
              />
            </div>

            {/* Backup Contact Info Section */}
            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Backup Contact</p>

              <div className="space-y-3">
                {/* Personal Email */}
                <div>
                  <label htmlFor="personalEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Personal Email
                  </label>
                  <input
                    id="personalEmail"
                    type="email"
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your.personal@gmail.com"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`px-3 py-2 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={isSaving} className="w-full" size="sm">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
