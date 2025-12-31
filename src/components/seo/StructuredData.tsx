'use client'

export interface OrganizationSchema {
  '@context': string
  '@type': string
  name: string
  url: string
  logo: string
  description: string
  contactPoint?: {
    '@type': string
    email: string
    contactType: string
  }
  sameAs?: string[]
}

export interface WebsiteSchema {
  '@context': string
  '@type': string
  name: string
  url: string
  description: string
  potentialAction?: {
    '@type': string
    target: string
    'query-input': string
  }
}

interface StructuredDataProps {
  data: OrganizationSchema | WebsiteSchema | object
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

// Pre-built schemas
export const organizationSchema: OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Corbez',
  url: 'https://corbez.com',
  logo: 'https://corbez.com/brand%20assets/logo@2x.png',
  description: 'Corporate benefits marketplace connecting employees with exclusive restaurant discounts',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@corbez.com',
    contactType: 'Customer Service',
  },
  sameAs: [
    'https://twitter.com/corbez',
    'https://linkedin.com/company/corbez',
    'https://instagram.com/corbez',
  ],
}

export const websiteSchema: WebsiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Corbez',
  url: 'https://corbez.com',
  description: 'Corporate restaurant discounts and employee benefits platform',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://corbez.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}
