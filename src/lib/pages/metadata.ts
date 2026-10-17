import type { Metadata } from 'next'

import type { PublicImage } from '../media/public'
import { HOME_SLUG, pagePath } from './slug'

type PageSeo = {
  title: string
  slug: string
  seo?: { title?: string | null; description?: string | null } | null
}

/** Defaults of the site for Open Graph (`SiteSettings`, tenant name). */
export type SiteSeo = { name: string; ogImage: PublicImage | null }

/** Open Graph image: the largest file of the image (sharing previews are ~1200 px wide). */
export function ogImages(
  image: PublicImage | null,
): { url: string; width: number; height: number; alt: string }[] {
  const source = image?.sources.at(-1)
  return image && source
    ? [{ url: source.url, width: image.width, height: image.height, alt: image.alt }]
    : []
}

/**
 * Metadata of one page. Missing fields fall back to the `[domain]` layout: the title
 * template and default description from `SiteSettings`, the tenant name on the home page.
 * Paths are relative; the layout's `metadataBase` makes them absolute for the request's domain.
 * Open Graph is complete here, because a page's `openGraph` replaces the layout's as a whole.
 */
export function pageMetadata({ title, slug, seo }: PageSeo, site: SiteSeo): Metadata {
  const metadata: Metadata = {}
  const seoTitle = seo?.title?.trim()
  if (seoTitle) metadata.title = seoTitle
  else if (slug !== HOME_SLUG) metadata.title = title
  if (seo?.description) metadata.description = seo.description
  const path = pagePath(slug)
  metadata.alternates = { canonical: path }
  metadata.openGraph = {
    type: 'website',
    locale: 'pl_PL',
    siteName: site.name,
    url: path,
    title: seoTitle || (slug === HOME_SLUG ? site.name : title),
    description: seo?.description ?? undefined,
    images: ogImages(site.ogImage),
  }
  return metadata
}
