import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import type { ServiceGridBlock as ServiceGridBlockData } from '@/payload-types'

import { BlockLink } from '../BlockLink'

export function ServiceGridBlock({ block }: { block: ServiceGridBlockData }) {
  const itemLevel = block.heading ? 3 : 2
  return (
    <Section surface="muted">
      {block.heading && <Heading level={2}>{block.heading}</Heading>}
      {block.intro && (
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-2">{block.intro}</p>
      )}
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {block.items.map((item, i) => (
          <li key={item.id ?? i} className="rounded-2xl border border-border bg-card p-6">
            <Heading level={itemLevel} size="md">
              {item.title}
            </Heading>
            {item.description && (
              <p className="mt-3 leading-relaxed text-ink-2">{item.description}</p>
            )}
            <BlockLink link={item.link} as="text" />
          </li>
        ))}
      </ul>
    </Section>
  )
}
