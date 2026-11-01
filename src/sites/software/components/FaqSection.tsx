import type React from 'react'

import { Container } from '@/components/ui/Container'
import { faqJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'

type Props = {
  /** Section id (the anchor); the heading gets `<id>-h`. One FAQ section per page. */
  id: string
  eyebrow: string | null
  heading: string
  lead: React.ReactNode
  /** Under the lead on the left (subpages: „Policz cały projekt w kreatorze”). */
  aside?: React.ReactNode
  items: readonly { question: string; answer: string }[]
  /** Start page: the grey band with a border; subpages sit on the page background. */
  band?: boolean
}

/**
 * Software FAQ (boards `Main` #faq, `Rozwiazanie`, `Branza` „Zanim zapytasz”): heading on the
 * left, question cards on the right from 1081 px, one column below; the first one open.
 * `<details>` works without JavaScript. Writes its `FAQPage` JSON-LD — only the questions shown.
 */
export function FaqSection({ id, eyebrow, heading, lead, aside, items, band = false }: Props) {
  if (items.length === 0) return null
  const headingId = `${id}-h`
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={
        band
          ? 'scroll-mt-24 border-t border-border bg-surface-2 py-12 min-[640px]:py-20'
          : 'scroll-mt-24 py-12 min-[640px]:py-20'
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd(items)) }}
      />
      <Container
        wide
        className="grid gap-[18px] min-[1081px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] min-[1081px]:gap-10"
      >
        <div className="flex flex-col gap-2.5 min-[1081px]:sticky min-[1081px]:top-28 min-[1081px]:self-start">
          {eyebrow ? (
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text min-[640px]:text-sm">
              {eyebrow}
            </p>
          ) : null}
          <h2
            id={headingId}
            className="font-display text-[32px] font-extrabold leading-[1.02] tracking-tight min-[640px]:text-5xl min-[1081px]:text-[56px]"
          >
            {heading}
          </h2>
          {lead ? (
            <p className="max-w-[40ch] text-lg text-ink-2 min-[640px]:text-xl">{lead}</p>
          ) : null}
          {aside ? <div className="mt-3">{aside}</div> : null}
        </div>
        <ul className="flex flex-col gap-2.5">
          {items.map((item, i) => (
            <li key={item.question}>
              <details
                data-reveal
                open={i === 0}
                className="group rounded-2xl bg-card shadow-[inset_0_0_0_1px_var(--border)] open:shadow-[inset_0_0_0_1.5px_var(--accent-line)]"
              >
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-[15.5px] font-extrabold min-[641px]:min-h-[58px] min-[641px]:px-5 min-[641px]:text-base [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="text-[22px] leading-none text-accent-text transition-[rotate] duration-200 group-open:rotate-45 motion-reduce:transition-none"
                  >
                    +
                  </span>
                </summary>
                <p className="px-4 pb-[18px] text-[15px] leading-relaxed text-ink-2 min-[641px]:px-5">
                  {item.answer}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
