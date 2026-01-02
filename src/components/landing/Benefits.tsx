'use client'

import ScrollReveal from './ScrollReveal'
import { usePersona } from '@/contexts/PersonaContext'
import { getPersonaContent } from '@/lib/content/personas'
import {
  getPersonaBadgeStyles,
  getPersonaHoverBorderColor,
  getPersonaIconBgClasses,
  getPersonaColor,
} from '@/lib/utils/persona-helpers'

const employeeBenefits = [
  {
    title: 'Feel Like a Regular',
    description: 'Walk into new restaurants with the confidence of someone who\'s been coming for years.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: 'Skip the Explanation',
    description: 'No more "I work at..." speeches. They already know you\'re someone worth knowing.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  {
    title: 'Reward Your Hard Work',
    description: 'You earned that job. Now let it earn you something back every time you eat out.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Discover New Favorites',
    description: 'Stop defaulting to the same lunch spot. Explore with savings as your guide.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
]

const restaurantBenefits = [
  {
    title: 'Know Your Neighbors',
    description: 'The office building next door is full of hungry people. Now they have a reason to pick you.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Predictable Revenue',
    description: 'Corporate lunch crowds are reliable. They come back. Week after week. Rain or shine.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    title: 'No Complicated Tech',
    description: 'If you can take a photo, you can scan a code. That\'s literally all it takes.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Your Rules, Your Way',
    description: 'Google employees get 15%. Tech startups get 10%. You make the call.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
]

export default function Benefits() {
  const { persona } = usePersona()

  // If persona is selected, get persona-specific benefits
  const personaBenefits = persona ? getPersonaContent(persona).benefits : null

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Show persona-specific section if persona is selected */}
        {personaBenefits ? (
          <div>
            <ScrollReveal>
              <div className="text-center mb-12">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${getPersonaBadgeStyles(persona)}`}>
                  {persona === 'employee' ? 'For the People Who Make Companies Run' :
                   persona === 'merchant' ? 'For the Places That Feed Them' :
                   'For the Teams That Lead Them'}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                  {persona === 'employee' ? 'Your job opens doors. Literally.' :
                   persona === 'merchant' ? 'Turn foot traffic into your tribe' :
                   'A Benefit That Actually Gets Used'}
                </h2>
                <p className="text-lg text-muted max-w-2xl mx-auto">
                  {persona === 'employee' ? 'You spend all day earning a living. Spend your lunch hour enjoying it.' :
                   persona === 'merchant' ? 'Those office workers walking by? They\'re looking for a place to belong. Be that place.' :
                   'Zero cost to you. Zero hassle. High adoption. Measurable impact.'}
                </p>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personaBenefits.map((benefit, index) => (
                <ScrollReveal key={benefit.title} delay={100 + index * 100}>
                  <div className={`bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all group h-full ${getPersonaHoverBorderColor(persona)}`}>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${getPersonaIconBgClasses(persona)}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-secondary mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted">
                      {benefit.description}
                    </p>
                    {benefit.metric && (
                      <div className={`mt-3 pt-3 border-t border-gray-100 text-sm font-semibold ${getPersonaColor(persona)}`}>
                        {benefit.metric}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        ) : (
          // Show both sections if no persona is selected
          <>
            {/* For Employees */}
            <div className="mb-20">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                For the People Who Make Companies Run
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Your job opens doors. Literally.
              </h2>
              <p className="text-lg text-muted max-w-2xl mx-auto">
                You spend all day earning a living. Spend your lunch hour enjoying it.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {employeeBenefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} delay={100 + index * 100}>
                <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all group h-full">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted">
                    {benefit.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* For Restaurants */}
        <div>
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-medium mb-4">
                For the Places That Feed Them
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                Turn foot traffic into your tribe
              </h2>
              <p className="text-lg text-muted max-w-2xl mx-auto">
                Those office workers walking by? They&apos;re looking for a place to belong. Be that place.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurantBenefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} delay={100 + index * 100}>
                <div className="bg-white rounded-xl p-6 border border-gray-100 hover:border-secondary/20 hover:shadow-lg transition-all group h-full">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-secondary mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted">
                    {benefit.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
          </>
        )}
      </div>
    </section>
  )
}
