'use client'

import { useState, useEffect } from 'react'
import { FAQItem } from '@/lib/content/faq-data'

interface FAQAccordionProps {
  faqs: FAQItem[]
  defaultOpenId?: string
  onExpand?: (faqId: string) => void
}

export function FAQAccordion({ faqs, defaultOpenId, onExpand }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId || null)

  // Handle deep-linking from URL hash
  useEffect(() => {
    const hash = window.location.hash.slice(1) // Remove the '#'
    if (hash && faqs.some(faq => faq.id === hash)) {
      setOpenId(hash)
      // Smooth scroll to the element
      setTimeout(() => {
        const element = document.getElementById(hash)
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    }
  }, [faqs])

  const toggleFAQ = (id: string) => {
    const newOpenId = openId === id ? null : id
    setOpenId(newOpenId)

    // Update URL hash for deep-linking
    if (newOpenId) {
      window.history.pushState(null, '', `#${id}`)
      // Track analytics
      onExpand?.(id)
    } else {
      window.history.pushState(null, '', window.location.pathname)
    }
  }

  if (faqs.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        No FAQs found. Try a different search or filter.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id

        return (
          <div
            key={faq.id}
            id={faq.id}
            className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-primary/30 transition-colors"
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${faq.id}`}
            >
              <span className="text-lg font-semibold text-secondary pr-4">
                {faq.question}
              </span>
              <svg
                className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div
              id={`faq-answer-${faq.id}`}
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
              }`}
              role="region"
              aria-labelledby={faq.id}
            >
              <div className="px-6 pb-6 pt-2">
                <p className="text-muted leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </p>

                {faq.relatedQuestions && faq.relatedQuestions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-sm font-medium text-secondary mb-2">
                      Related questions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {faq.relatedQuestions.map((relatedId) => {
                        const relatedFaq = faqs.find(f => f.id === relatedId)
                        if (!relatedFaq) return null

                        return (
                          <a
                            key={relatedId}
                            href={`#${relatedId}`}
                            onClick={(e) => {
                              e.preventDefault()
                              setOpenId(relatedId)
                              window.history.pushState(null, '', `#${relatedId}`)
                              document.getElementById(relatedId)?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                              })
                            }}
                            className="text-sm text-primary hover:text-primary-dark underline"
                          >
                            {relatedFaq.question}
                          </a>
                        )
                      })}
                    </div>
                  </div>
                )}

                {faq.tags && faq.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {faq.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Simplified version for embedding in other pages (e.g., pricing)
interface CompactFAQAccordionProps {
  faqs: FAQItem[]
  className?: string
}

export function CompactFAQAccordion({ faqs, className = '' }: CompactFAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className={`space-y-3 ${className}`}>
      {faqs.map((faq) => {
        const isOpen = openId === faq.id

        return (
          <div
            key={faq.id}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white"
          >
            <button
              onClick={() => setOpenId(isOpen ? null : faq.id)}
              className="w-full text-left px-5 py-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-secondary">{faq.question}</span>
              <svg
                className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isOpen && (
              <div className="px-5 pb-4">
                <p className="text-muted text-sm leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
