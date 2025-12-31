import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/content/blog-posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://corbez.com'

  // Static pages
  const routes = [
    '',
    '/about',
    '/pricing',
    '/how-it-works',
    '/for-employees',
    '/for-restaurants',
    '/contact',
    '/privacy',
    '/terms',
    '/login',
    '/register',
    '/blog',
    '/faq',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : route === '/blog' ? 0.9 : 0.8,
  }))

  // Blog posts
  const posts = getAllPosts()
  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt || post.publishedAt,
    changeFrequency: 'monthly' as const,
    priority: post.featured ? 0.9 : 0.7,
  }))

  return [...routes, ...blogRoutes]
}
