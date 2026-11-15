import type { Metadata } from 'next'

import { biznesDescription, fitTitle } from '../biznes/seo'
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

/** The generated sharing card of the Biznes pages (`app/(sites)/[domain]/og/strona`). */
export const BIZNES_OG_PAGE = '/og/strona'

/** The generated sharing card of a Biznes post (`og/wpis/[slug]`), 1200 × 630. */
export function biznesPostOgImage(slug: string, title: string) {
  return [{ url: `/og/wpis/${encodeURIComponent(slug)}`, width: 1200, height: 630, alt: title }]
}

/** Open Graph image: the largest file of the image (sharing previews are ~1200 px wide). */
export function ogImages(
  image: PublicImage | null,
  line?: Line,
): { url: string; width: number; height: number; alt: string }[] {
  const source = image?.sources.at(-1)
  if (image && source) {
    return [{ url: source.url, width: image.width, height: image.height, alt: image.alt }]
  }
  // No picture of the page nor of the settings: a shared link still gets a preview (audit 01.11:
  // 118 pages without og:image). Biznes: its generated 1200 × 630 card (`og/strona`, audyt 15.11
  // wieczorem §3.3); the other lines that opted in: their 512 px mark.
  if (line === 'biznes') return [{ url: BIZNES_OG_PAGE, width: 1200, height: 630, alt: '' }]
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
  // Biznes subpages: 30–60 characters with the suffix, descriptions 100–155 (audit 0611 P1-8).
  const fit = site.line === 'biznes' && slug !== HOME_SLUG
  const panelTitle = seo?.title?.trim()
  const seoTitle = panelTitle && fit ? fitTitle(panelTitle) : panelTitle
  if (seoTitle) metadata.title = seoTitle
  else if (slug !== HOME_SLUG) metadata.title = fit ? fitTitle(title) : title
  const description =
    seo?.description && fit ? biznesDescription(seo.description) : seo?.description
  if (description) metadata.description = description
  const path = pagePath(slug)
  metadata.alternates = { canonical: path }
  metadata.openGraph = {
    type: 'website',
    locale: 'pl_PL',
    siteName: site.name,
    url: path,
    title: seoTitle || (slug === HOME_SLUG ? site.name : (metadata.title as string)),
    description: description ?? undefined,
    images: ogImages(site.ogImage, site.line),
  }
  return metadata
}
