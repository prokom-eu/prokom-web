import { Heading } from '@/components/ui/Heading'
import { Section } from '@/components/ui/Section'
import { faqJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'
import type { FaqBlock as FaqBlockData } from '@/payload-types'

// `<details>` works without JavaScript and is accessible by default.
export function FaqBlock({ block }: { block: FaqBlockData }) {
  return (
    <Section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd(block.items)) }}
      />
      <div className="max-w-3xl">
        {block.eyebrow && (
          <p className="mb-3 text-sm font-bold tracking-[0.08em] text-accent-text uppercase">
            {block.eyebrow}
          </p>
        )}
        {block.heading && <Heading level={2}>{block.heading}</Heading>}
        {block.lead && <p className="mt-4 text-lg leading-relaxed text-ink-2">{block.lead}</p>}
        <div className="mt-8 divide-y divide-border border-y border-border">
          {block.items.map((item, i) => (
            <details key={item.id ?? i} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center [&::-webkit-details-marker]:hidden justify-between gap-4 py-4 font-bold">
                {item.question}
                <span
                  aria-hidden="true"
                  className="h-1 w-4 shrink-0 rounded-full bg-accent transition-transform group-open:rotate-90"
                />
              </summary>
              <p className="pb-5 leading-relaxed text-ink-2">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}
