'use client'

import { useState } from 'react'
import ScrollReveal from './ScrollReveal'

const employeeSteps = [
  {
    step: 1,
    title: 'Prove You Belong',
    description: 'Your work email is your ticket. One quick verification and you\'re in the club.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    step: 2,
    title: 'Carry Your Status',
    description: 'Your pass lives in your phone. Always with you. Always ready.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: 'Get the Treatment',
    description: 'Flash your code. Watch their face light up. Enjoy the savings.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

const restaurantSteps = [
  {
    step: 1,
    title: 'Open Your Doors',
    description: 'Tell us you\'re ready to welcome your corporate neighbors. First 6 months on us.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    step: 2,
    title: 'Make It Yours',
    description: 'You decide who gets what. Same deal for everyone, or VIP treatment for your favorites.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    step: 3,
    title: 'Build Loyalty',
    description: 'One scan. Instant recognition. Watch strangers become regulars.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'employees' | 'restaurants'>('employees')

  const steps = activeTab === 'employees' ? employeeSteps : restaurantSteps

  return (
    <section className="py-20 bg-white" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Ridiculously Simple
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Three steps. That&apos;s it. No apps to download. No cards to carry. No friction.
            </p>
          </div>
        </ScrollReveal>

        {/* Tab Switcher */}
        <ScrollReveal delay={100}>
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('employees')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'employees'
                    ? 'bg-white text-secondary shadow-sm'
                    : 'text-muted hover:text-secondary'
                }`}
              >
                I Work Here
              </button>
              <button
                onClick={() => setActiveTab('restaurants')}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'restaurants'
                    ? 'bg-white text-secondary shadow-sm'
                    : 'text-muted hover:text-secondary'
                }`}
              >
                I Own a Restaurant
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <ScrollReveal key={step.step} delay={200 + index * 100}>
              <div className="relative h-full">
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/20 to-accent/20" />
                )}

                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                    activeTab === 'employees' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'
                  }`}>
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-secondary mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted">
                    {step.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
