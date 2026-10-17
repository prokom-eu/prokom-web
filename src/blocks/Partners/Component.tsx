import { MediaImage } from '@/components/MediaImage'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { getPartners } from '@/lib/partners/data'
import type { PartnersBlock as PartnersBlockData } from '@/payload-types'

/** Logo wall of the partners assigned to this site. No partners → the block is not shown. */
export async function PartnersBlock({
  block,
  tenantId,
}: {
  block: PartnersBlockData
  tenantId: number
}) {
  const partners = await getPartners(tenantId)
  if (partners.length === 0) return null
  return (
    <Section>
      {block.heading && <Heading level={2}>{block.heading}</Heading>}
      {block.lead && (
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-2">{block.lead}</p>
      )}
      <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {partners.map((partner) => {
          const logo = (
            <MediaImage
              image={partner.logo}
              sizes="(min-width: 1024px) 160px, 40vw"
              className="h-12 w-auto object-contain"
            />
          )
          return (
            <li
              key={partner.id}
              className="flex items-center justify-center rounded-2xl border border-border bg-card p-6"
            >
              {partner.url ? (
                <a href={partner.url} rel="noopener" target="_blank">
                  {logo}
                  <span className="sr-only"> (otwiera się w nowej karcie)</span>
                </a>
              ) : (
                logo
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
