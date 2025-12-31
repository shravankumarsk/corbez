'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { BlogPost } from '@/lib/content/blog-posts'
import BlogCard from '@/components/blog/BlogCard'

interface BlogListingProps {
  initialPosts: BlogPost[]
}

export default function BlogListing({ initialPosts }: BlogListingProps) {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const categoryParam = searchParams.get('category') || 'all'

  const filteredPosts = useMemo(() => {
    let filtered = initialPosts

    // Filter by category
    if (categoryParam !== 'all') {
      filtered = filtered.filter(post => post.category === categoryParam)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        post =>
          post.title.toLowerCase().includes(query) ||
          post.excerpt.toLowerCase().includes(query) ||
          post.tags.some(tag => tag.toLowerCase().includes(query)) ||
          post.author.name.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [initialPosts, categoryParam, searchQuery])

  const featuredPosts = filteredPosts.filter(post => post.featured).slice(0, 2)
  const regularPosts = filteredPosts.filter(post => !post.featured || featuredPosts.length < 2)

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search articles by title, topic, or keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 pl-14 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-secondary"
            />
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <p className="text-muted text-center">
            {filteredPosts.length === 0 ? (
              <span>No articles found. Try a different search or category.</span>
            ) : filteredPosts.length === 1 ? (
              <span>Showing 1 article</span>
            ) : (
              <span>
                Showing {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''}
                {categoryParam !== 'all' && (
                  <span className="capitalize"> in {categoryParam}</span>
                )}
                {searchQuery && <span> matching &quot;{searchQuery}&quot;</span>}
              </span>
            )}
          </p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && !searchQuery && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-secondary mb-6">Featured Articles</h2>
            <div className="grid gap-8">
              {featuredPosts.map(post => (
                <BlogCard key={post.slug} post={post} featured />
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        {regularPosts.length > 0 && (
          <div>
            {featuredPosts.length > 0 && !searchQuery && (
              <h2 className="text-2xl font-bold text-secondary mb-6">All Articles</h2>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map(post => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-secondary mb-2">No articles found</h3>
            <p className="text-muted mb-6">
              Try adjusting your search or browsing a different category
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                window.history.pushState({}, '', '/blog')
              }}
              className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              View All Articles
            </button>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-20 bg-gradient-to-br from-primary/10 to-orange-50 rounded-2xl p-8 md:p-12 border border-gray-200">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-secondary mb-4">Stay Updated</h2>
            <p className="text-lg text-muted mb-8">
              Get the latest insights on corporate benefits, restaurant marketing, and workplace
              trends delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none"
                required
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white font-semibold px-8 py-3 rounded-xl transition-all whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-muted mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
