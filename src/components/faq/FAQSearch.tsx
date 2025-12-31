'use client'

import { useState, useEffect, useMemo } from 'react'
import Fuse from 'fuse.js'
import { FAQItem } from '@/lib/content/faq-data'

interface FAQSearchProps {
  faqs: FAQItem[]
  onSearchResults: (results: FAQItem[]) => void
  onSearchQuery?: (query: string) => void // Track search queries for analytics
  placeholder?: string
}

export function FAQSearch({
  faqs,
  onSearchResults,
  onSearchQuery,
  placeholder = 'Search FAQs...'
}: FAQSearchProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(faqs, {
      keys: [
        { name: 'question', weight: 3 }, // Prioritize matches in questions
        { name: 'answer', weight: 2 },
        { name: 'tags', weight: 1.5 },
        { name: 'category', weight: 1 }
      ],
      threshold: 0.4, // 0 = exact match, 1 = match anything
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    })
  }, [faqs])

  // Perform search when query changes
  useEffect(() => {
    if (query.trim().length === 0) {
      // Show all FAQs when search is empty
      onSearchResults(faqs)
    } else {
      const results = fuse.search(query)
      const matches = results.map(result => result.item)
      onSearchResults(matches)

      // Track search query for analytics
      if (onSearchQuery) {
        const timeoutId = setTimeout(() => {
          onSearchQuery(query)
        }, 1000) // Debounce analytics tracking
        return () => clearTimeout(timeoutId)
      }
    }
  }, [query, faqs, fuse, onSearchResults, onSearchQuery])

  const handleClear = () => {
    setQuery('')
    onSearchResults(faqs)
  }

  return (
    <div className="relative">
      <div
        className={`relative flex items-center border-2 rounded-xl transition-all ${
          isFocused
            ? 'border-primary shadow-lg shadow-primary/10'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        {/* Search Icon */}
        <div className="absolute left-4 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 bg-transparent focus:outline-none text-secondary placeholder:text-gray-400"
          aria-label="Search FAQs"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 text-gray-400 hover:text-secondary transition-colors"
            aria-label="Clear search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Search Status */}
      {query && (
        <div className="mt-2 text-sm text-muted">
          {fuse.search(query).length === 0 ? (
            <span>No results found for &ldquo;{query}&rdquo;</span>
          ) : (
            <span>
              Found {fuse.search(query).length} result
              {fuse.search(query).length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Compact search variant for embedding in other pages
interface CompactFAQSearchProps {
  faqs: FAQItem[]
  onSearchResults: (results: FAQItem[]) => void
  className?: string
}

export function CompactFAQSearch({ faqs, onSearchResults, className = '' }: CompactFAQSearchProps) {
  const [query, setQuery] = useState('')

  const fuse = useMemo(() => {
    return new Fuse(faqs, {
      keys: ['question', 'answer', 'tags'],
      threshold: 0.4,
      minMatchCharLength: 2
    })
  }, [faqs])

  useEffect(() => {
    if (query.trim().length === 0) {
      onSearchResults(faqs)
    } else {
      const results = fuse.search(query)
      onSearchResults(results.map(r => r.item))
    }
  }, [query, faqs, fuse, onSearchResults])

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  )
}

// Search with suggestions/autocomplete
interface FAQSearchWithSuggestionsProps {
  faqs: FAQItem[]
  onSelectFAQ: (faq: FAQItem) => void
  onSearchQuery?: (query: string) => void
}

export function FAQSearchWithSuggestions({
  faqs,
  onSelectFAQ,
  onSearchQuery
}: FAQSearchWithSuggestionsProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<FAQItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const fuse = useMemo(() => {
    return new Fuse(faqs, {
      keys: [
        { name: 'question', weight: 3 },
        { name: 'tags', weight: 2 }
      ],
      threshold: 0.3,
      includeScore: true
    })
  }, [faqs])

  useEffect(() => {
    if (query.trim().length >= 2) {
      const results = fuse.search(query).slice(0, 5) // Top 5 suggestions
      setSuggestions(results.map(r => r.item))
      setShowSuggestions(true)
      setSelectedIndex(-1)

      // Track search
      if (onSearchQuery) {
        const timeoutId = setTimeout(() => onSearchQuery(query), 1000)
        return () => clearTimeout(timeoutId)
      }
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [query, fuse, onSearchQuery, faqs])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      onSelectFAQ(suggestions[selectedIndex])
      setQuery('')
      setShowSuggestions(false)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  const handleSelectSuggestion = (faq: FAQItem) => {
    onSelectFAQ(faq)
    setQuery('')
    setShowSuggestions(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Type to search..."
          className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          aria-autocomplete="list"
          aria-controls="faq-suggestions"
          aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
        />
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          id="faq-suggestions"
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto"
        >
          {suggestions.map((faq, index) => (
            <li
              key={faq.id}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === selectedIndex}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-gray-50 text-secondary'
              }`}
              onClick={() => handleSelectSuggestion(faq)}
            >
              <div className="font-medium mb-1">{faq.question}</div>
              <div className="text-sm text-muted line-clamp-2">{faq.answer}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
