'use client'

import { useState, useRef, useEffect } from 'react'
import {
  MERCHANT_SECURITY_TERMS,
  MERCHANT_SECURITY_TERMS_VERSION,
  MERCHANT_SECURITY_TERMS_EFFECTIVE_DATE,
} from '@/lib/content/merchant-security-terms'

interface StepSecurityTermsProps {
  data: {
    securityTermsAccepted: boolean
  }
  onChange: (data: { securityTermsAccepted: boolean; securityTermsVersion: string }) => void
}

export default function StepSecurityTerms({ data, onChange }: StepSecurityTermsProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)
  const termsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = termsContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 10 // 10px threshold
      setHasScrolledToBottom(scrolledToBottom)
    }

    // Check if content is already fully visible (no scroll needed)
    const isContentFullyVisible = container.scrollHeight <= container.clientHeight
    if (isContentFullyVisible) {
      setHasScrolledToBottom(true)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAcceptanceChange = (accepted: boolean) => {
    onChange({
      securityTermsAccepted: accepted,
      securityTermsVersion: MERCHANT_SECURITY_TERMS_VERSION,
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-secondary mb-2">Security & Compliance Terms</h2>
        <p className="text-muted">
          Please review and accept our merchant terms to complete your onboarding
        </p>
      </div>

      {/* Version Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-sm">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <div>
            <span className="font-medium text-blue-900">Version {MERCHANT_SECURITY_TERMS_VERSION}</span>
            <span className="text-blue-700 ml-2">• Effective {MERCHANT_SECURITY_TERMS_EFFECTIVE_DATE}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Terms Container */}
      <div className="relative">
        <div
          ref={termsContainerRef}
          className="bg-white border-2 border-gray-200 rounded-xl p-6 max-h-[400px] overflow-y-auto scroll-smooth"
        >
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 mb-6">
              These terms outline security, compliance, and operational requirements for merchants
              partnering with Corbez platform.
            </p>

            {MERCHANT_SECURITY_TERMS.map((section, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg font-semibold text-secondary mb-3">{section.title}</h3>
                <ul className="space-y-2 list-disc list-inside">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-700 leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="border-t border-gray-200 pt-4 mt-6">
              <p className="text-sm text-gray-600">
                By accepting these terms, you acknowledge that you have read, understood, and agree
                to comply with all requirements outlined above. Failure to comply may result in
                account suspension or termination.
              </p>
              <p className="text-sm text-gray-600 mt-2">
                For questions or concerns, contact{' '}
                <a href="mailto:merchant-support@corbez.com" className="text-primary hover:underline">
                  merchant-support@corbez.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        {!hasScrolledToBottom && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-3 text-center pointer-events-none">
            <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium animate-bounce">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>Scroll to read all terms</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Acceptance Checkbox */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={data.securityTermsAccepted}
            onChange={(e) => handleAcceptanceChange(e.target.checked)}
            disabled={!hasScrolledToBottom}
            className="mt-1 h-5 w-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
          />
          <div className="flex-1">
            <span
              className={`font-medium ${
                hasScrolledToBottom ? 'text-secondary' : 'text-gray-400'
              }`}
            >
              I have read and agree to the Merchant Security & Compliance Terms
            </span>
            <p className="text-xs text-muted mt-1">
              Version {MERCHANT_SECURITY_TERMS_VERSION} • {MERCHANT_SECURITY_TERMS_EFFECTIVE_DATE}
            </p>
            {!hasScrolledToBottom && (
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Please scroll to the bottom to enable acceptance
              </p>
            )}
          </div>
        </label>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm">
            <p className="font-medium text-amber-900 mb-1">Important</p>
            <p className="text-amber-700">
              Your account will be submitted for platform admin approval after completing this step.
              You&apos;ll receive an email notification once your account is reviewed.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
