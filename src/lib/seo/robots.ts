import type { Metadata } from 'next'

import type { Env } from '../env'

/** `robots.txt` of a site; staging is closed to every crawler (ADR-004, S7). */
export function robotsTxt(siteEnv: Env['SITE_ENV'], origin: string): string {
  if (siteEnv === 'staging') return 'User-agent: *\nDisallow: /\n'
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`
}

/** `robots` metadata of every page: `noindex, nofollow` on staging, default elsewhere. */
export function robotsMeta(siteEnv: Env['SITE_ENV']): Metadata['robots'] {
  return siteEnv === 'staging' ? { index: false, follow: false } : undefined
}
