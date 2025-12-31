import Image from 'next/image'
import Link from 'next/link'
import { BlogPost } from '@/lib/content/blog-posts'

interface BlogHeroProps {
  post: BlogPost
}

export default function BlogHero({ post }: BlogHeroProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const updatedDate = post.updatedAt
    ? new Date(post.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="relative">
      {/* Breadcrumbs */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/" className="text-muted hover:text-primary transition-colors">
              Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link href="/blog" className="text-muted hover:text-primary transition-colors">
              Blog
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li>
            <Link
              href={`/blog?category=${post.category}`}
              className="text-muted hover:text-primary transition-colors capitalize"
            >
              {post.category}
            </Link>
          </li>
        </ol>
      </nav>

      {/* Category Badge */}
      <div className="mb-4">
        <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold capitalize">
          {post.category}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-6 leading-tight">
        {post.title}
      </h1>

      {/* Excerpt */}
      <p className="text-xl text-muted mb-8 max-w-3xl">{post.excerpt}</p>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-gray-200">
        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
            <Image
              src={post.author.avatar}
              alt={post.author.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="font-semibold text-secondary">{post.author.name}</div>
            <div className="text-sm text-muted">{post.author.role}</div>
          </div>
        </div>

        <div className="hidden sm:block w-px h-12 bg-gray-200" />

        {/* Date and Read Time */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>
              {formattedDate}
              {updatedDate && (
                <span className="text-xs ml-1">(Updated {updatedDate})</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden mb-12">
        <Image
          src={post.image.url}
          alt={post.image.alt}
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Share Buttons */}
      <div className="sticky top-24 float-left -ml-20 hidden xl:block">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Share
          </span>

          {/* Twitter */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
              post.title
            )}&url=${encodeURIComponent(`https://corbez.com/blog/${post.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-[#1DA1F2] text-gray-600 hover:text-white rounded-full transition-all"
            aria-label="Share on Twitter"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
            </svg>
          </a>

          {/* LinkedIn */}
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              `https://corbez.com/blog/${post.slug}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-[#0A66C2] text-gray-600 hover:text-white rounded-full transition-all"
            aria-label="Share on LinkedIn"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>

          {/* Email */}
          <a
            href={`mailto:?subject=${encodeURIComponent(
              post.title
            )}&body=${encodeURIComponent(
              `Check out this article: https://corbez.com/blog/${post.slug}`
            )}`}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-700 text-gray-600 hover:text-white rounded-full transition-all"
            aria-label="Share via Email"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </a>

          {/* Copy Link */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(`https://corbez.com/blog/${post.slug}`)
              alert('Link copied to clipboard!')
            }}
            className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-700 text-gray-600 hover:text-white rounded-full transition-all"
            aria-label="Copy link"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
