'use client'

import { useEffect, useState } from 'react'
import { ActivationChecklist, OnboardingProgress } from './ActivationChecklist'

export function ActivationChecklistWrapper() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [userName, setUserName] = useState<string>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProgress() {
      try {
        const response = await fetch('/api/employee/onboarding-progress')
        if (response.ok) {
          const data = await response.json()
          setProgress(data.progress)
          setUserName(data.userName)
        }
      } catch (error) {
        console.error('Failed to fetch onboarding progress:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  if (loading || !progress) {
    return null
  }

  return <ActivationChecklist progress={progress} userName={userName} />
}
