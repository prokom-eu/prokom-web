import { pagePath } from '../pages/slug'

type SitemapPage = { slug: string; updatedAt?: string | null }

/** Address of a route outside `Pages` (catalog, products), as a path of the site. */
type SitemapPath = { path: string; updatedAt?: string | null }

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/** `sitemap.xml` with the published pages of one site at their public paths, then `paths`. */
export function sitemapXml(
  origin: string,
  pages: readonly SitemapPage[],
  paths: readonly SitemapPath[] = [],
): string {
  const entries = [
    ...pages.map(({ slug, updatedAt }) => ({ path: pagePath(slug), updatedAt })),
    ...paths,
  ]
  const urls = entries.map(({ path, updatedAt }) => {
    const lastmod = updatedAt ? `<lastmod>${escapeXml(updatedAt)}</lastmod>` : ''
    return `  <url><loc>${escapeXml(origin + path)}</loc>${lastmod}</url>`
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}
