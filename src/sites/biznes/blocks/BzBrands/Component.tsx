import { MediaImage } from '@/components/MediaImage'
import { Container } from '@/components/ui/Container'
import { getPartners } from '@/lib/partners/data'
import type { BzBrandsBlock as BzBrandsBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'

type Props = { block: BzBrandsBlockData; tenantId: number }

/**
 * „Marki” of `/o-firmie` (plansza OFirmie): the logos of this site's Partners as a still grid
 * (the home page has the moving bar). Only partners with a logo file; without any, the heading
 * and the note (statuses) stay.
 */
export async function BzBrandsBlock({ block, tenantId }: Props) {
  const partners = await getPartners(tenantId)
  const headingId = `marki-${block.id ?? 'sekcja'}-h`
  return (
    <section aria-labelledby={headingId} className="bg-surface-2 py-14 sm:py-20">
      <Container wide>
        <SectionHead id={headingId} eyebrow={block.eyebrow} heading={block.heading} />
        {partners.length > 0 && (
          <ul className="mt-8 grid grid-cols-2 gap-3 min-[640px]:grid-cols-3 min-[1080px]:grid-cols-6">
            {partners.map((partner) => (
              <li
                key={partner.id}
                className="flex h-[84px] items-center justify-center rounded-[18px] bg-white px-6 shadow-[inset_0_0_0_1px_var(--border)]"
              >
                <MediaImage
                  image={partner.logo}
                  sizes="160px"
                  className="max-h-12 w-auto max-w-full object-contain"
                />
              </li>
            ))}
          </ul>
        )}
        {block.note && (
          <p className="mt-6 max-w-[80ch] text-[13px] leading-relaxed text-ink-2">{block.note}</p>
        )}
      </Container>
    </section>
  )
}
