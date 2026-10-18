import type { Metadata } from 'next'

import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'

import { requireLine } from '../../tenant'

type Props = { params: Promise<{ domain: string }> }

export const metadata: Metadata = {
  title: 'Lista zapytania',
  robots: { index: false, follow: true },
}

// Placeholder until B8 builds the inquiry list; it proves the line guard end to end.
export default async function InquiryListPage({ params }: Props) {
  // The layout already guards; repeated here so the page never renders on its own.
  await requireLine(params, 'biznes')
  return (
    <Section className="py-24">
      <Heading level={1} size="xl">
        Lista zapytania
      </Heading>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">
        Ta część strony jest w przygotowaniu.
      </p>
    </Section>
  )
}
