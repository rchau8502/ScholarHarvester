import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const now = new Date()
  const routes = ['/', '/planner', '/search', '/ingest', '/privacy', '/terms', '/contact']

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now
  }))
}
