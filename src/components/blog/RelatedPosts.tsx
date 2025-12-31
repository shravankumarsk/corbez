import { BlogPost } from '@/lib/content/blog-posts'
import BlogCard from './BlogCard'

interface RelatedPostsProps {
  posts: BlogPost[]
  title?: string
}

export default function RelatedPosts({
  posts,
  title = 'Related Articles',
}: RelatedPostsProps) {
  if (posts.length === 0) return null

  return (
    <section className="mt-16 pt-16 border-t border-gray-200">
      <h2 className="text-3xl font-bold text-secondary mb-8">{title}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}
