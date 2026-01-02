'use client'

import ScrollReveal from './ScrollReveal'
import { usePersona } from '@/contexts/PersonaContext'
import { getPersonaContent } from '@/lib/content/personas'

const defaultStats = [
  {
    value: 'One',
    label: 'Platform',
    description: 'connecting companies and local restaurants',
  },
  {
    value: 'Zero',
    label: 'Hassle',
    description: 'just show up and save',
  },
  {
    value: 'Every',
    label: 'Lunch',
    description: 'your workplace opens doors',
  },
  {
    value: 'Real',
    label: 'Savings',
    description: 'on the meals you already buy',
  },
]

export default function Stats() {
  const { persona } = usePersona()

  // Get persona-specific stats if persona is selected
  const stats = persona ? getPersonaContent(persona).stats : defaultStats
  return (
    <section className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {persona ? (
                persona === 'employee' ? 'Built for How You Actually Work' :
                persona === 'merchant' ? 'Built for How Restaurants Actually Win' :
                'The Simple Math of Success'
              ) : (
                "It's not complicated. It's just better."
              )}
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              {persona ? (
                persona === 'employee' ? 'Your company badge shouldn\'t just get you in the building—let it get you recognized everywhere you go.' :
                persona === 'merchant' ? 'Corporate customers are the most reliable crowd in the restaurant business. We help you capture them.' :
                'We\'re building something simple: Companies + Restaurants + Savings. That\'s it.'
              ) : (
                'No gimmicks. No friction. Just a better way to connect companies, restaurants, and the people who make both run.'
              )}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <ScrollReveal key={stat.label} delay={100 + index * 100}>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-primary-light mb-1">
                  {stat.label}
                </div>
                {('description' in stat && stat.description) ? (
                  <div className="text-sm text-white/60">
                    {stat.description as string}
                  </div>
                ) : null}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
