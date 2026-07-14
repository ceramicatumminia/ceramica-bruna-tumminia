import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/carrello', '/checkout', '/api/'],
    },
    sitemap: 'https://ceramicatumminia.it/sitemap.xml',
  }
}
