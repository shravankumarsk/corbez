'use client'

import { useState } from 'react'
import Link from 'next/link'
import { requestPasswordReset } from '@/lib/actions/auth.actions'
import { sendPasswordResetEmail } from '@/lib/services/email/resend'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await requestPasswordReset(email)

      if (result.success && 'token' in result && result.token) {
        // Send the reset email
        await sendPasswordResetEmail(email, result.token)
      }

      // Always show success to prevent email enumeration
      setSuccess(true)
    } catch (err) {
      console.error('Password reset error:', err)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <Link href="/" className="block text-center mb-6">
            <span className="text-3xl font-bold">
              <span className="text-secondary">cor</span>
              <span className="text-primary">bez</span>
            </span>
          </Link>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-secondary">Check your email</h2>
            <p className="text-muted mb-6">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
            </p>
            <p className="text-sm text-muted mb-6">
              The link will expire in 1 hour.
            </p>
            <Link
              href="/login"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <Link href="/" className="block text-center mb-6">
          <span className="text-3xl font-bold">
            <span className="text-secondary">cor</span>
            <span className="text-primary">bez</span>
          </span>
        </Link>

        <h2 className="text-2xl font-bold text-center mb-2 text-secondary">Forgot password?</h2>
        <p className="text-center text-muted mb-6">
          No worries, we&apos;ll send you reset instructions.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

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
                Sending...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
