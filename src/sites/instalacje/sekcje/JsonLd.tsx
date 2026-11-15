import { serializeJsonLd } from '@/lib/seo/jsonLd'

/** Structured data in the page; `serializeJsonLd` escapes `<`, so panel texts cannot break out. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}
