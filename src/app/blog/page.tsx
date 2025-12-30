import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import Link from 'next/link'

export default function BlogPage() {
  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-6">
              The <span className="text-primary">corbez</span> Blog
            </h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Insights on corporate benefits, workplace culture, and building local food communities.
            </p>
          </div>

          {/* Coming Soon */}
          <div className="bg-background rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-secondary mb-4">Coming Soon</h2>
            <p className="text-muted mb-8 max-w-md mx-auto">
              We&apos;re working on some great content about corporate benefits, local food scenes, and building workplace communities. Check back soon!
            </p>

            {/* Topics Preview */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {[
                'Corporate Culture',
                'Employee Benefits',
                'Local Restaurants',
                'Workplace Wellness',
                'Food & Community',
              ].map((topic) => (
                <span
                  key={topic}
                  className="px-4 py-2 bg-white rounded-full text-sm text-muted border border-gray-200"
                >
                  {topic}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-white rounded-xl p-6 max-w-md mx-auto border border-gray-200">
              <h3 className="font-semibold text-secondary mb-2">Get notified when we launch</h3>
              <p className="text-sm text-muted mb-4">
                Be the first to know when we publish new articles.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-6 rounded-xl transition-all"
              >
                Stay Updated
              </Link>
            </div>
          </div>

          {/* In the meantime */}
          <div className="mt-12 text-center">
            <p className="text-muted mb-4">In the meantime, learn more about what we do:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/how-it-works"
                className="text-primary hover:text-primary-dark font-medium"
              >
                How It Works
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/about"
                className="text-primary hover:text-primary-dark font-medium"
              >
                About Us
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/for-employees"
                className="text-primary hover:text-primary-dark font-medium"
              >
                For Employees
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
