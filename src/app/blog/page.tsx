import { Metadata } from 'next'
import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import BlogListing from './BlogListing'
import { getAllPosts } from '@/lib/content/blog-posts'

export const metadata: Metadata = {
  title: 'Blog - Corporate Benefits & Restaurant Insights',
  description:
    'Insights on corporate benefits, restaurant marketing, employee engagement, and the future of workplace dining. Expert guides for restaurants, companies, and HR leaders.',
  openGraph: {
    title: 'Corbez Blog - Corporate Benefits & Restaurant Insights',
    description:
      'Expert insights on corporate benefits, restaurant marketing, and workplace dining trends.',
    type: 'website',
    url: 'https://corbez.com/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corbez Blog - Corporate Benefits & Restaurant Insights',
    description:
      'Expert insights on corporate benefits, restaurant marketing, and workplace dining trends.',
  },
  alternates: {
    canonical: 'https://corbez.com/blog',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 via-white to-orange-50 pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6">
                The <span className="text-primary">Corbez</span> Blog
              </h1>
              <p className="text-xl text-muted leading-relaxed">
                Expert insights on corporate benefits, restaurant marketing, employee engagement,
                and the future of workplace dining. Data-driven guides for restaurants, companies,
                and HR leaders.
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-12">
              {[
                { label: 'All Posts', value: 'all', color: 'bg-primary text-white' },
                { label: 'For Restaurants', value: 'restaurants', color: 'bg-white text-secondary' },
                { label: 'For Companies', value: 'companies', color: 'bg-white text-secondary' },
                { label: 'Industry Insights', value: 'insights', color: 'bg-white text-secondary' },
                { label: 'How-To Guides', value: 'guides', color: 'bg-white text-secondary' },
              ].map(category => (
                <a
                  key={category.value}
                  href={`?category=${category.value === 'all' ? '' : category.value}`}
                  className={`px-6 py-3 rounded-full font-semibold transition-all hover:shadow-lg ${category.color} border border-gray-200`}
                >
                  {category.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Listing */}
        <BlogListing initialPosts={posts} />
      </main>
      <Footer />
    </>
  )
}
