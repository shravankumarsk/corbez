'use client'

import Link from 'next/link'
import ScrollReveal from './ScrollReveal'
import { usePersona } from '@/contexts/PersonaContext'
import { getPersonaContent } from '@/lib/content/personas'
import {
  getPersonaBadgeStyles,
  getPersonaDotColor,
  getPersonaColor,
  getPersonaButtonColor,
  getPersonaButtonShadow,
} from '@/lib/utils/persona-helpers'

export default function Hero() {
  const { persona } = usePersona()

  // Get persona-specific content if persona is selected
  const personaContent = persona ? getPersonaContent(persona).hero : null
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-gradient-to-b from-background to-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <ScrollReveal delay={0}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${getPersonaBadgeStyles(persona)}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${getPersonaDotColor(persona)}`} />
              {personaContent ? personaContent.badge : 'Where work meets local flavor'}
            </div>
          </ScrollReveal>

          {/* Headline - Emotional, not feature-based */}
          <ScrollReveal delay={100}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary leading-tight mb-6">
              {personaContent ? (
                personaContent.headline
              ) : (
                <>
                  Your company badge just became your{' '}
                  <span className="text-primary">favorite restaurant&apos;s VIP pass</span>
                </>
              )}
            </h1>
          </ScrollReveal>

          {/* Subtitle - Focus on feeling */}
          <ScrollReveal delay={200}>
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10">
              {personaContent ? (
                personaContent.subheadline
              ) : (
                <>
                  Walk in. Get recognized. Feel valued.
                  <br className="hidden sm:block" />
                  That&apos;s the corbez experience.
                </>
              )}
            </p>
          </ScrollReveal>

          {/* CTAs - Action-oriented, tribal */}
          <ScrollReveal delay={300}>
            {personaContent ? (
              // Single persona-specific CTA
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link
                  href={`/register?type=${persona}`}
                  className={`w-full sm:w-auto text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 ${getPersonaButtonColor(persona)} ${getPersonaButtonShadow(persona)}`}
                >
                  {personaContent.cta.primary}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                {personaContent.cta.secondary && (
                  <Link
                    href="#how-it-works"
                    className="w-full sm:w-auto bg-white hover:bg-gray-50 text-secondary border-2 border-gray-200 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
                  >
                    {personaContent.cta.secondary}
                  </Link>
                )}
              </div>
            ) : (
              // Generic dual CTAs
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <Link
                  href="/register?type=employee"
                  className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Claim Your Perks
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/register?type=merchant"
                  className="w-full sm:w-auto bg-secondary hover:bg-secondary-light text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-secondary/25 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Welcome Your Neighbors
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            )}
          </ScrollReveal>

          {/* Trust indicators - Feeling-based, not feature-based */}
          <ScrollReveal delay={400}>
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted">
              {personaContent ? (
                // Persona-specific trust indicators
                personaContent.trustIndicators.map((indicator, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <svg className={`w-5 h-5 ${getPersonaColor(persona)}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{indicator}</span>
                  </div>
                ))
              ) : (
                // Generic trust indicators
                <>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Built for companies & restaurants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>No apps, no hassle</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Real savings, real simple</span>
                  </div>
                </>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Hero Cards - Story-driven */}
        <ScrollReveal delay={500}>
          <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-2xl p-8 md:p-12">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Employee Story */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-secondary mb-2">You Belong Here</h3>
                  <p className="text-sm text-muted">Your workplace already opens doors. Now it opens restaurant doors too.</p>
                </div>

                {/* Connection Story */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-secondary mb-2">Instant Recognition</h3>
                  <p className="text-sm text-muted">No awkward explanations. Just show up and be welcomed like a regular.</p>
                </div>

                {/* Restaurant Story */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-secondary mb-2">Build Your Tribe</h3>
                  <p className="text-sm text-muted">Restaurants: turn the office next door into your most loyal lunch crowd.</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
