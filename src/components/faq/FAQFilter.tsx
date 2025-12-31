'use client'

import { useState } from 'react'
import { FAQCategory, FAQAudience } from '@/lib/content/faq-data'

interface FAQFilterProps {
  onAudienceChange: (audience: FAQAudience | 'all') => void
  onCategoryChange: (category: FAQCategory | 'all') => void
  className?: string
}

const audienceOptions: Array<{ value: FAQAudience | 'all'; label: string; icon: string }> = [
  { value: 'all', label: 'Everyone', icon: '👥' },
  { value: 'employee', label: 'Employees', icon: '💼' },
  { value: 'merchant', label: 'Restaurants', icon: '🍴' },
  { value: 'company', label: 'Companies', icon: '🏢' }
]

const categoryOptions: Array<{ value: FAQCategory | 'all'; label: string; icon: string }> = [
  { value: 'all', label: 'All Topics', icon: '📚' },
  { value: 'getting-started', label: 'Getting Started', icon: '🚀' },
  { value: 'billing', label: 'Billing & Pricing', icon: '💳' },
  { value: 'discounts', label: 'Discounts & Perks', icon: '🎁' },
  { value: 'technical', label: 'Technical', icon: '⚙️' },
  { value: 'security', label: 'Security & Privacy', icon: '🔒' },
  { value: 'general', label: 'General', icon: 'ℹ️' }
]

export function FAQFilter({ onAudienceChange, onCategoryChange, className = '' }: FAQFilterProps) {
  const [selectedAudience, setSelectedAudience] = useState<FAQAudience | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all')

  const handleAudienceClick = (audience: FAQAudience | 'all') => {
    setSelectedAudience(audience)
    onAudienceChange(audience)
  }

  const handleCategoryClick = (category: FAQCategory | 'all') => {
    setSelectedCategory(category)
    onCategoryChange(category)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Audience Filter */}
      <div>
        <h3 className="text-sm font-semibold text-secondary mb-3">I am a...</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {audienceOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAudienceClick(option.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                selectedAudience === option.value
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              aria-pressed={selectedAudience === option.value}
            >
              <span className="text-2xl" aria-hidden="true">
                {option.icon}
              </span>
              <span
                className={`text-sm font-medium ${
                  selectedAudience === option.value ? 'text-primary' : 'text-secondary'
                }`}
              >
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-semibold text-secondary mb-3">Topic</h3>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleCategoryClick(option.value)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === option.value
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-secondary hover:bg-gray-200'
              }`}
              aria-pressed={selectedCategory === option.value}
            >
              <span aria-hidden="true">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedAudience !== 'all' || selectedCategory !== 'all') && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted">Active filters:</span>
          {selectedAudience !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {audienceOptions.find(o => o.value === selectedAudience)?.label}
              <button
                onClick={() => handleAudienceClick('all')}
                className="hover:bg-primary/20 rounded-full p-0.5"
                aria-label="Remove audience filter"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {categoryOptions.find(o => o.value === selectedCategory)?.label}
              <button
                onClick={() => handleCategoryClick('all')}
                className="hover:bg-primary/20 rounded-full p-0.5"
                aria-label="Remove category filter"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          )}
          <button
            onClick={() => {
              handleAudienceClick('all')
              handleCategoryClick('all')
            }}
            className="text-sm text-primary hover:text-primary-dark underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}

// Compact filter variant for sidebar
interface CompactFAQFilterProps {
  onAudienceChange: (audience: FAQAudience | 'all') => void
  onCategoryChange: (category: FAQCategory | 'all') => void
  className?: string
}

export function CompactFAQFilter({ onAudienceChange, onCategoryChange, className = '' }: CompactFAQFilterProps) {
  const [selectedAudience, setSelectedAudience] = useState<FAQAudience | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all')

  const handleAudienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as FAQAudience | 'all'
    setSelectedAudience(value)
    onAudienceChange(value)
  }

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as FAQCategory | 'all'
    setSelectedCategory(value)
    onCategoryChange(value)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Audience Dropdown */}
      <div>
        <label htmlFor="audience-filter" className="block text-sm font-medium text-secondary mb-2">
          I am a...
        </label>
        <select
          id="audience-filter"
          value={selectedAudience}
          onChange={handleAudienceChange}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {audienceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category Dropdown */}
      <div>
        <label htmlFor="category-filter" className="block text-sm font-medium text-secondary mb-2">
          Topic
        </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.icon} {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
