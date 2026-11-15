import { breadcrumbJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'

/**
 * `BreadcrumbList` of a hub subpage (spec §4 „JSON-LD”, audit H8): PRO-KOM → the page, with the
 * names of the boards' crumbs („PRO-KOM / Oferta”). Absolute addresses of the request's domain.
 */
export function HubBreadcrumbJsonLd({
  name,
  path,
  origin,
}: {
  name: string
  path: string
  origin: string
}) {
  const items = [
    { name: 'PRO-KOM', url: `${origin}/` },
    { name, url: `${origin}${path}` },
  ]
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd(items)) }}
    />
  )
}
