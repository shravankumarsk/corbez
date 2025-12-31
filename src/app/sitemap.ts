import { MetadataRoute } from 'next'

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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }))

  return routes
}
