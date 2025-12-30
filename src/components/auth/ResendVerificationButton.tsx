'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface Props {
  email: string
}

export default function ResendVerificationButton({ email }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleResend = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Verification email sent!' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send email' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button variant="primary" size="sm" onClick={handleResend} isLoading={isLoading} className="mt-3">
        Resend Verification Email
      </Button>
      {message && (
        <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}
