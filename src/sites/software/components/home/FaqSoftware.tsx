import { fillText } from '@/lib/software/facts'
import type { FaqBlock as FaqBlockData } from '@/payload-types'

import { FaqSection } from '../FaqSection'
import { softwareTextContext } from '../textContext'

type Props = { block: FaqBlockData; tenantId: number }

/** The field is optional in the shared block: never an empty `h2` the section points to. */
const DEFAULT_HEADING = 'Najczęstsze pytania'

/**
 * Software look of the shared FAQ block (`#faq`, spec. §4 pkt 11, board `Main`, ADR-014
 * rozstrz. 7) in `FaqSection`. Facts in the answers (`[OPIEKA OD]`)
 * are filled; on production a question with a missing fact is left out, also from `FAQPage`.
 */
export async function FaqSoftware({ block, tenantId }: Props) {
  const context = await softwareTextContext(tenantId)
  const items = block.items.flatMap((item) => {
    const question = fillText(item.question, context)
    const answer = fillText(item.answer, context)
    return question && answer ? [{ id: item.id, question, answer }] : []
  })
  if (items.length === 0) return null
  const eyebrow = block.eyebrow ? fillText(block.eyebrow, context) : null
  const lead = block.lead ? fillText(block.lead, context) : null
  const heading = (block.heading && fillText(block.heading, context)) || DEFAULT_HEADING

  return (
    <FaqSection
      id="faq"
      band
      eyebrow={eyebrow}
      heading={heading}
      lead={lead}
      items={items.map(({ question, answer }) => ({ question, answer }))}
    />
  )
}
