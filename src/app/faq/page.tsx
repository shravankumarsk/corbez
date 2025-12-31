'use client'

import { useState, useMemo } from 'react'
import { Navbar, Footer } from '@/components/landing'
import { FAQAccordion } from '@/components/faq/FAQAccordion'
import { FAQSearch } from '@/components/faq/FAQSearch'
import { FAQFilter } from '@/components/faq/FAQFilter'
import { faqData, FAQCategory, FAQAudience, FAQItem } from '@/lib/content/faq-data'

export default function FAQPage() {
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>(faqData)
  const [selectedAudience, setSelectedAudience] = useState<FAQAudience | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'all'>('all')
  const [searchResults, setSearchResults] = useState<FAQItem[]>(faqData)

  // Combine filters and search
  const displayedFAQs = useMemo(() => {
    let result = searchResults

    // Apply audience filter
    if (selectedAudience !== 'all') {
      result = result.filter(
        faq => faq.audience === selectedAudience || faq.audience === 'all'
      )
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      result = result.filter(faq => faq.category === selectedCategory)
    }

    // Sort by priority
    return result.sort((a, b) => b.priority - a.priority)
  }, [searchResults, selectedAudience, selectedCategory])

  const handleAudienceChange = (audience: FAQAudience | 'all') => {
    setSelectedAudience(audience)
  }

  const handleCategoryChange = (category: FAQCategory | 'all') => {
    setSelectedCategory(category)
  }

  const handleSearchResults = (results: FAQItem[]) => {
    setSearchResults(results)
  }

  const handleSearchQuery = (query: string) => {
    // Analytics tracking - implement your analytics here
    console.log('FAQ search query:', query)
    // Example: track('faq_search', { query })
  }

  const handleFAQExpand = (faqId: string) => {
    // Analytics tracking - implement your analytics here
    console.log('FAQ expanded:', faqId)
    // Example: track('faq_expand', { faq_id: faqId })
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-muted mb-8">
                Find answers to common questions about Corbez. Can&apos;t find what you&apos;re looking for?{' '}
                <a href="mailto:support@corbez.com" className="text-primary hover:text-primary-dark underline">
                  Contact us
                </a>
              </p>

              {/* Search Bar */}
              <div className="mb-8">
                <FAQSearch
                  faqs={faqData}
                  onSearchResults={handleSearchResults}
                  onSearchQuery={handleSearchQuery}
                  placeholder="Search for answers..."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Filters and FAQs */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div className="mb-12">
              <FAQFilter
                onAudienceChange={handleAudienceChange}
                onCategoryChange={handleCategoryChange}
              />
            </div>

            {/* Results Count */}
            <div className="mb-6 text-center">
              <p className="text-muted">
                Showing {displayedFAQs.length} question{displayedFAQs.length === 1 ? '' : 's'}
              </p>
            </div>

            {/* FAQ List */}
            <div className="max-w-4xl mx-auto">
              <FAQAccordion
                faqs={displayedFAQs}
                onExpand={handleFAQExpand}
              />
            </div>

            {/* No Results */}
            {displayedFAQs.length === 0 && (
              <div className="max-w-2xl mx-auto text-center py-12">
                <svg
                  className="w-20 h-20 mx-auto text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-secondary mb-2">
                  No questions found
                </h3>
                <p className="text-muted mb-6">
                  Try adjusting your filters or search terms, or contact our support team for help.
                </p>
                <a
                  href="mailto:support@corbez.com"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-semibold transition-all"
                >
                  Contact Support
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </section>

        {/* Still Have Questions CTA */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-secondary mb-4">
              Still have questions?
            </h2>
            <p className="text-xl text-muted mb-8">
              Our team is here to help. Get in touch and we&apos;ll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@corbez.com"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Support
              </a>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-secondary border-2 border-gray-200 px-8 py-4 rounded-xl font-semibold transition-all"
              >
                Back to Home
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Schema.org FAQPage Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqData.map(faq => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer
              }
            }))
          })
        }}
      />
    </>
  )
}
