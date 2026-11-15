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

/**
 * `robots` of a page that may be kept out of the index (a filtered view, a card „Do
 * sprawdzenia”): staging stays shut whatever the page, elsewhere links are still followed.
 */
export function pageRobots(siteEnv: Env['SITE_ENV'], indexable: boolean): Metadata['robots'] {
  return robotsMeta(siteEnv) ?? (indexable ? undefined : { index: false, follow: true })
}
