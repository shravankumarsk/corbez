import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/super-admin/',
          '/verify-email',
          '/reset-password',
        ],
      },
    ],
    sitemap: 'https://corbez.com/sitemap.xml',
  }
}
