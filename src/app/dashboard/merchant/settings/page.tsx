'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function MerchantSettingsPage() {
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile and account preferences</p>
      </div>

      <Card variant="bordered">
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Profile Information</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-gray-100">
                    <span className="text-primary text-2xl font-bold">{initials}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                  Upload photo
                </button>
                {previewImage && (
                  <>
                    <span className="text-gray-300">|</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Max 500KB, JPG or PNG</p>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Corbez ID (read-only) */}
            {corbezId && (
              <div className="bg-gradient-to-r from-primary/5 to-orange-50 border border-primary/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your corbez ID
                    </label>
                    <p className="text-2xl font-mono font-bold text-primary tracking-wider">{corbezId}</p>
                    <p className="text-xs text-gray-500 mt-1">This is your unique portable ID - it never changes</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(corbezId)}
                    className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    title="Copy ID"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Work Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Email
              </label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Primary login email - cannot be changed</p>
            </div>

            {/* Backup Contact Info Section */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Backup Contact Info</h3>
              <p className="text-xs text-gray-500 mb-4">
                Add personal contact info so you don&apos;t lose access if you change jobs
              </p>

              <div className="space-y-4">
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your.personal@gmail.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">Used for account recovery if you leave your company</p>
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                  <p className="text-xs text-gray-500 mt-1">For verification and important notifications</p>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`px-4 py-3 rounded-xl text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" disabled={isSaving} className="w-full">
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
