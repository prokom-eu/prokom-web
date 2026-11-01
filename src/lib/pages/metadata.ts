import type { Metadata } from 'next'

import { brandAsset } from '../brand/lines'
import type { PublicImage } from '../media/public'
import type { Line } from '../tenant/lines'
import { HOME_SLUG, pagePath } from './slug'

type PageSeo = {
  title: string
  slug: string
  seo?: { title?: string | null; description?: string | null } | null
}

/**
 * Defaults of the site for Open Graph (`SiteSettings`, tenant name). `line`: a page without any
 * image falls back to the line's mark (`ogImages`); only lines that opted in pass it.
 */
export type SiteSeo = { name: string; ogImage: PublicImage | null; line?: Line }

/** Open Graph image: the largest file of the image (sharing previews are ~1200 px wide). */
export function ogImages(
  image: PublicImage | null,
  line?: Line,
): { url: string; width: number; height: number; alt: string }[] {
  const source = image?.sources.at(-1)
  if (image && source) {
    return [{ url: source.url, width: image.width, height: image.height, alt: image.alt }]
  }
  // No picture of the page nor of the settings: the line's 512 px mark, so a shared link still
  // has a preview (audit 01.11: 118 pages without og:image).
  // TODO(krystian): grafika 1200×630 linii (plansza marki) zamiast znaku 512 px.
  return line ? [{ url: brandAsset(line, 'icon-512.png'), width: 512, height: 512, alt: '' }] : []
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
    images: ogImages(site.ogImage, site.line),
  }
  return metadata
}
