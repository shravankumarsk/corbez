'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface InviteInfo {
  code: string
  companyId: string
  companyName: string
  email?: string
  expiresAt: string
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE',
    // Company Admin fields
    companyName: '',
    companyCity: '',
    companyState: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Invite code state
  const [inviteCode, setInviteCode] = useState('')
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [inviteError, setInviteError] = useState('')
  const [verifyingInvite, setVerifyingInvite] = useState(false)

  // Referral code state (from ref= URL param)
  const [referralCode, setReferralCode] = useState('')
  const [referrerInfo, setReferrerInfo] = useState<{
    name: string
    companyName?: string
  } | null>(null)

  // Verify invite code
  const verifyInviteCode = useCallback(async (code: string) => {
    if (!code || code.length < 9) {
      setInviteInfo(null)
      setInviteError('')
      return
    }

    setVerifyingInvite(true)
    setInviteError('')

    try {
      const response = await fetch(`/api/auth/verify-invite?code=${encodeURIComponent(code)}`)
      const data = await response.json()

      if (data.success) {
        setInviteInfo(data.invite)
        setInviteError('')
        // If invite is tied to specific email, auto-fill it
        if (data.invite.email && !formData.email) {
          setFormData((prev) => ({ ...prev, email: data.invite.email }))
        }
      } else {
        setInviteInfo(null)
        setInviteError(data.error || 'Invalid invite code')
      }
    } catch (err) {
      setInviteInfo(null)
      setInviteError('Failed to verify invite code')
    } finally {
      setVerifyingInvite(false)
    }
  }, [formData.email])

  // Check for invite code and referral code in URL on mount
  useEffect(() => {
    const codeFromUrl = searchParams.get('code')
    if (codeFromUrl) {
      setInviteCode(codeFromUrl.toUpperCase())
      verifyInviteCode(codeFromUrl)
    }

    // Check for referral code
    const refFromUrl = searchParams.get('ref')
    if (refFromUrl) {
      setReferralCode(refFromUrl)
      // Fetch referrer info
      fetch(`/api/referral/validate?code=${encodeURIComponent(refFromUrl)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setReferrerInfo(data.referrer)
          }
        })
        .catch(() => {})
    }
  }, [searchParams, verifyInviteCode])

  // Debounced invite code verification
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inviteCode.length >= 9) {
        verifyInviteCode(inviteCode)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [inviteCode, verifyInviteCode])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    return minLength && hasUppercase && hasLowercase && hasNumber
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('All fields are required')
      return
    }

    // Validate company fields for Company Admin
    if (formData.role === 'COMPANY_ADMIN') {
      if (!formData.companyName || !formData.companyCity || !formData.companyState) {
        setError('Company name, city, and state are required')
        return
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!validatePassword(formData.password)) {
      setError(
        'Password must be at least 8 characters and contain uppercase, lowercase, and numbers'
      )
      return
    }

    setIsLoading(true)

    try {
      const payload: Record<string, string> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      }

      // Include invite code for employees
      if (formData.role === 'EMPLOYEE' && inviteCode && inviteInfo) {
        payload.inviteCode = inviteCode
      }

      // Include company info for company admins
      if (formData.role === 'COMPANY_ADMIN') {
        payload.companyName = formData.companyName
        payload.companyCity = formData.companyCity
        payload.companyState = formData.companyState
      }

      // Include referral code if present
      if (referralCode) {
        payload.referralCode = referralCode
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Registration failed')
        return
      }

      // Redirect to login
      router.push('/login?registered=true')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Logo */}
        <Link href="/" className="block text-center mb-6">
          <span className="text-3xl font-bold">
            <span className="text-secondary">cor</span><span className="text-primary">bez</span>
          </span>
        </Link>

        <h2 className="text-2xl font-bold text-center mb-2 text-secondary">Create Account</h2>
        <p className="text-center text-muted mb-6">Join corbez and start saving</p>

        {/* Referral Banner */}
        {referrerInfo && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Referred by <span className="text-primary">{referrerInfo.name}</span>
                </p>
                {referrerInfo.companyName && (
                  <p className="text-xs text-gray-600">from {referrerInfo.companyName}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-secondary mb-1">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-secondary mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 12a2 2 0 100-4 2 2 0 000 4zm3.071-5.929A4 4 0 105.929 13.071a4 4 0 006.142-6.142zM3.464 4.464A5.986 5.986 0 0110 3c4.477 0 8.268 2.943 9.542 7a10 10 0 01-1.102 2.816A6 6 0 0010 5a5.994 5.994 0 00-6.536 6.536z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-muted mt-1">
              Min 8 chars, uppercase, lowercase, and number
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-secondary mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-secondary transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 12a2 2 0 100-4 2 2 0 000 4zm3.071-5.929A4 4 0 105.929 13.071a4 4 0 006.142-6.142zM3.464 4.464A5.986 5.986 0 0110 3c4.477 0 8.268 2.943 9.542 7a10 10 0 01-1.102 2.816A6 6 0 0010 5a5.994 5.994 0 00-6.536 6.536z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-secondary mb-1">
              Account Type
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={(e) => {
                handleChange(e)
                // Clear invite code when switching away from employee
                if (e.target.value !== 'EMPLOYEE') {
                  setInviteCode('')
                  setInviteInfo(null)
                  setInviteError('')
                }
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all appearance-none bg-white"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="MERCHANT">Restaurant</option>
              <option value="COMPANY_ADMIN">Company Admin</option>
            </select>
          </div>

          {/* Company Info Fields - Only for Company Admins */}
          {formData.role === 'COMPANY_ADMIN' && (
            <div className="space-y-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-sm font-medium text-blue-800">Company Information</p>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-secondary mb-1">
                  Company Name
                </label>
                <input
                  id="companyName"
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Acme Corporation"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="companyCity" className="block text-sm font-medium text-secondary mb-1">
                    City
                  </label>
                  <input
                    id="companyCity"
                    type="text"
                    name="companyCity"
                    value={formData.companyCity}
                    onChange={handleChange}
                    placeholder="San Francisco"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="companyState" className="block text-sm font-medium text-secondary mb-1">
                    State
                  </label>
                  <input
                    id="companyState"
                    type="text"
                    name="companyState"
                    value={formData.companyState}
                    onChange={handleChange}
                    placeholder="CA"
                    maxLength={2}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Invite Code Field - Only for Employees */}
          {formData.role === 'EMPLOYEE' && (
            <div>
              <label htmlFor="inviteCode" className="block text-sm font-medium text-secondary mb-1">
                Invite Code <span className="text-muted font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  id="inviteCode"
                  type="text"
                  value={inviteCode}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '')
                    setInviteCode(value)
                    if (value.length < 9) {
                      setInviteInfo(null)
                      setInviteError('')
                    }
                  }}
                  placeholder="XXXX-XXXX"
                  maxLength={9}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    inviteInfo
                      ? 'border-accent focus:ring-accent'
                      : inviteError
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-200 focus:ring-primary'
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {verifyingInvite ? (
                    <svg className="w-5 h-5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : inviteInfo ? (
                    <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : inviteError ? (
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                </div>
              </div>
              {inviteInfo && (
                <div className="mt-2 p-3 bg-accent/10 border border-accent/20 rounded-xl">
                  <p className="text-sm text-secondary">
                    You&apos;ll be joining <span className="font-semibold">{inviteInfo.companyName}</span>
                  </p>
                </div>
              )}
              {inviteError && (
                <p className="mt-1 text-sm text-red-600">{inviteError}</p>
              )}
              <p className="mt-1 text-xs text-muted">
                Have an invite code from your company? Enter it to auto-join.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-muted">Already have an account? </span>
          <Link href="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
