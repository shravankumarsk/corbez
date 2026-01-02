'use client'

/**
 * PersonaGateway Component
 * Allows users to self-select their persona (employee, merchant, company admin)
 * Sets persona cookie and redirects to appropriate landing page
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { getPersonaDisplayName, getPersonaRoute, type PersonaType } from '@/lib/content/personas'
import { trackPersonaSelection, trackPersonaGatewayView } from '@/lib/analytics/persona-events'
import { getPersonaIconBgClasses, getPersonaColor } from '@/lib/utils/persona-helpers'
import { usePromotion } from '@/lib/hooks/usePromotion'

interface PersonaCardData {
  persona: PersonaType
  icon: React.ReactNode
  description: string
  benefits: string[]
  cta: string
}

export default function PersonaGateway() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const promo = usePromotion()

  const personaCards: PersonaCardData[] = [
    {
      persona: 'employee',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: 'Save money on every meal',
      benefits: ['Free forever', 'Up to 30% off', 'Instant access'],
      cta: 'Claim Your Perks',
    },
    {
      persona: 'merchant',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      description: 'Build your lunch crowd',
      benefits: [`${promo.trialText} free`, 'No transaction fees', 'Simple setup'],
      cta: 'Start Free Trial',
    },
    {
      persona: 'company',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      description: 'Zero-cost employee perk',
      benefits: ['100% free', 'No admin overhead', 'Happy employees'],
      cta: 'See the ROI',
    },
  ]

  // Track when gateway is viewed
  useEffect(() => {
    trackPersonaGatewayView()
  }, [])

  const handlePersonaSelect = (persona: PersonaType) => {
    // Track persona selection
    trackPersonaSelection({
      persona,
      source: 'gateway',
      timestamp: new Date(),
      previousPersona: null,
    })
    // Set persona cookie (30-day expiry)
    Cookies.set('corbez_persona', persona, {
      expires: 30,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    setIsNavigating(true)

    // Redirect to persona-specific landing page
    const route = getPersonaRoute(persona)
    router.push(route)
  }

  return (
    <section id="persona-gateway" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Who Are You?
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Choose your path to get started with corbez.
            <br className="hidden sm:block" />
            We&apos;ll show you exactly what matters to you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {personaCards.map((card) => (
            <button
              key={card.persona}
              onClick={() => handlePersonaSelect(card.persona)}
              disabled={isNavigating}
              className="group relative bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-primary hover:shadow-xl transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Icon */}
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110 ${getPersonaIconBgClasses(card.persona)}`}>
                {card.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-secondary mb-2">
                {getPersonaDisplayName(card.persona)}
              </h3>

              {/* Description */}
              <p className="text-muted mb-4">
                {card.description}
              </p>

              {/* Benefits */}
              <ul className="space-y-2 mb-6">
                {card.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className={`w-4 h-4 flex-shrink-0 ${getPersonaColor(card.persona)}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className={`inline-flex items-center gap-2 font-semibold transition-all group-hover:gap-3 ${getPersonaColor(card.persona)}`}>
                {card.cta}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-muted mt-8">
          Not sure which you are?{' '}
          <button
            onClick={() => router.push('/faq')}
            className="text-primary hover:text-primary-dark font-medium underline"
          >
            Learn more about how corbez works
          </button>
        </p>
      </div>
    </section>
  )
}
