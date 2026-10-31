import { connection } from 'next/server'

import { InquiryForm } from '@/components/InquiryForm'
import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { getEnv } from '@/lib/env'
import { issueFormToken } from '@/lib/inquiry/spam'
import type { InquiryFormBlock as InquiryFormBlockData } from '@/payload-types'

/**
 * Form section; `#formularz` is the anchor other pages link to (`/kontakt#formularz`).
 * The token carries the render time (minimum fill time), so this never comes from a cache.
 */
export async function InquiryFormBlock({
  block,
  phoneFirst = false,
  phoneRequired = false,
}: {
  block: InquiryFormBlockData
  /** Biznes line: a missing contact is reported on the phone (`lib/inquiry/schema`). */
  phoneFirst?: boolean
  /** Instalacje line: the phone is required (`lib/inquiry/schema`). */
  phoneRequired?: boolean
}) {
  await connection()
  const formToken = issueFormToken(getEnv().PAYLOAD_SECRET)
  return (
    <Section id="formularz" className="scroll-mt-24">
      <div className="max-w-3xl">
        {block.heading && <Heading level={2}>{block.heading}</Heading>}
        {block.text && <p className="mt-4 text-lg leading-relaxed text-ink-2">{block.text}</p>}
        <div className="mt-8">
          <InquiryForm
            formToken={formToken}
            category={block.category}
            phoneFirst={phoneFirst}
            phoneRequired={phoneRequired}
          />
        </div>
      </div>
    </Section>
  )
}
