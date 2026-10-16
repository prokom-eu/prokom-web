import type { Metadata } from 'next'

import { HOME_SLUG } from './slug'

type PageSeo = {
  title: string
  slug: string
  seo?: { title?: string | null; description?: string | null } | null
}

/**
 * Metadata of one page. Missing fields fall back to the `[domain]` layout: the title
 * template and default description from `SiteSettings`, the tenant name on the home page.
 */
export function pageMetadata({ title, slug, seo }: PageSeo): Metadata {
  const metadata: Metadata = {}
  const seoTitle = seo?.title?.trim()
  if (seoTitle) metadata.title = seoTitle
  else if (slug !== HOME_SLUG) metadata.title = title
  if (seo?.description) metadata.description = seo.description
  return metadata
}
