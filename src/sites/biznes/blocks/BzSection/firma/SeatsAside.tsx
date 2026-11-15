import { parseSectionData } from '@/lib/biznes/pages/sections'
import { withVisibleSupplyLink } from '@/lib/biznes/procurement/links'
import { getCatalogIndex } from '@/lib/catalog/data'
import { cx } from '@/components/ui/cx'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'

import { CARD, EYEBROW } from '../ui'
import { Seats } from './CareWidgetsLazy'

/**
 * „Ile masz stanowisk?” as a card next to the FAQ's questions (Web-opieka-it, PREMIUM-1011): the
 * section's label, heading (H3 under the FAQ's H2) and lead, then the seat picker. A link to a
 * procurement page shows only once that page is published (plan 0611 §6.4).
 */
export async function SeatsAside({ block, tenantId }: { block: BzSectionData; tenantId: number }) {
  const data = parseSectionData('seats', block.data)
  if (!data) return null
  const seats = data.link ? withVisibleSupplyLink(data, await getCatalogIndex(tenantId)) : data
  return (
    <div className={cx(CARD, 'flex flex-col gap-3 p-6 text-ink max-md:p-5')} data-seats-card>
      {block.eyebrow && <p className={cx(EYEBROW, 'text-accent-text')}>{block.eyebrow}</p>}
      {block.heading && (
        <h3 className="font-display text-[1.4rem] leading-tight font-extrabold">{block.heading}</h3>
      )}
      {block.lead && <p className="text-[15px] leading-relaxed text-ink-2">{block.lead}</p>}
      <Seats data={seats} />
    </div>
  )
}
