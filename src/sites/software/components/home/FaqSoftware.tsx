import { fillText } from '@/lib/software/facts'
import type { FaqBlock as FaqBlockData } from '@/payload-types'

import { FaqSection } from '../FaqSection'
import { softwareTextContext } from '../textContext'

type Props = { block: FaqBlockData; tenantId: number }

/** The field is optional in the shared block: never an empty `h2` the section points to. */
const DEFAULT_HEADING = 'Najczęstsze pytania'

export type SoftwareFaq = {
  eyebrow: string | null
  heading: string
  lead: string | null
  items: { question: string; answer: string }[]
}

/**
 * The FAQ block with its facts filled (`[OPIEKA OD]`): on production a question with a missing
 * fact is left out, also from `FAQPage`. `null` when no question is left.
 */
export async function softwareFaq(
  block: FaqBlockData,
  tenantId: number,
): Promise<SoftwareFaq | null> {
  const context = await softwareTextContext(tenantId)
  const items = block.items.flatMap((item) => {
    const question = fillText(item.question, context)
    const answer = fillText(item.answer, context)
    return question && answer ? [{ question, answer }] : []
  })
  if (items.length === 0) return null
  return {
    eyebrow: block.eyebrow ? fillText(block.eyebrow, context) : null,
    heading: (block.heading && fillText(block.heading, context)) || DEFAULT_HEADING,
    lead: block.lead ? fillText(block.lead, context) : null,
    items,
  }
}

/**
 * Software look of the shared FAQ block (`#faq`, spec. §4 pkt 11, board `Main`, ADR-014
 * rozstrz. 7) in `FaqSection`. On the v24 start page a FAQ followed by the contact block renders
 * with it in `FaqContact` instead (`faqContactPair`).
 */
export async function FaqSoftware({ block, tenantId }: Props) {
  const faq = await softwareFaq(block, tenantId)
  if (!faq) return null
  return <FaqSection id="faq" band {...faq} />
}
