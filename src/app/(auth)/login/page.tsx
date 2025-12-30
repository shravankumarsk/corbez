'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else if (result?.ok) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error('Login error:', err)
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

        <h2 className="text-2xl font-bold text-center mb-2 text-secondary">Welcome back</h2>
        <p className="text-center text-muted mb-6">Sign in to your account</p>

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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-dark font-medium transition-colors">
              Forgot password?
            </Link>
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
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-muted">Don&apos;t have an account? </span>
          <Link href="/register" className="text-primary hover:text-primary-dark font-semibold transition-colors">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
