'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface ManualEntryProps {
  onSubmit: (code: string) => void
  isLoading?: boolean
}

export default function ManualEntry({ onSubmit, isLoading }: ManualEntryProps) {
  const [code, setCode] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim()) {
      onSubmit(code.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Verification Code"
        placeholder="Enter the employee's code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        helperText="Ask the employee for their verification code if QR scanning isn't working"
      />
      <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={!code.trim()}>
        Verify Employee
      </Button>
    </form>
  )
}
