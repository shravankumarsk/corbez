import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/lib/content/blog-posts'

interface BlogCardProps {
  post: BlogPost
  featured?: boolean
}

export default function BlogCard({ post, featured = false }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-xl">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Image */}
            <div className="relative h-64 md:h-full min-h-[300px]">
              <Image
                src={post.image.url}
                alt={post.image.alt}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              {post.featured && (
                <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Featured
                </div>
              )}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-secondary">
                {post.readTime} min read
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium capitalize">
                  {post.category}
                </span>
                <span className="text-sm text-muted">{formattedDate}</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h2>

              <p className="text-muted mb-6 line-clamp-3">{post.excerpt}</p>

              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-secondary text-sm">
                    {post.author.name}
                  </div>
                  <div className="text-xs text-muted">{post.author.role}</div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="h-full bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl flex flex-col">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.image.url}
            alt={post.image.alt}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-secondary">
            {post.readTime} min
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
              {post.category}
            </span>
            <span className="text-xs text-muted">{formattedDate}</span>
          </div>

          <h3 className="text-xl font-bold text-secondary mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="text-sm text-muted mb-4 line-clamp-3 flex-1">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-secondary text-xs truncate">
                {post.author.name}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
