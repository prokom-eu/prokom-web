import { pagePath } from '../pages/slug'

type SitemapPage = { slug: string; updatedAt?: string | null }

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

/** `sitemap.xml` with the published pages of one site, at their public paths. */
export function sitemapXml(origin: string, pages: readonly SitemapPage[]): string {
  const urls = pages.map(({ slug, updatedAt }) => {
    const lastmod = updatedAt ? `<lastmod>${escapeXml(updatedAt)}</lastmod>` : ''
    return `  <url><loc>${escapeXml(origin + pagePath(slug))}</loc>${lastmod}</url>`
  })
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}
