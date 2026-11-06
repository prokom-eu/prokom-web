import type { ReactNode } from 'react'

import { faqJsonLd, serializeJsonLd } from '@/lib/seo/jsonLd'

export type FaqItem = { question: string; answer?: string | null }

type Props = {
  id?: string
  eyebrow?: string
  /** H2, e.g. „Zanim zadzwonisz”. */
  title: string
  lead?: string | null
  items: readonly FaqItem[]
  /** Under the lead on the left, e.g. a contact card (status, phone, e-mail). */
  aside?: ReactNode
  /** `FAQPage` structured data (off when the page already has it). */
  jsonLd?: boolean
}

/**
 * Questions of every line (spec §5 `FaqBlock`, board Moduły): the heading on the left (sticky on
 * wide screens), the questions on the right as native `<details>` cards numbered 01…, the first
 * open; JSON-LD `FAQPage`. A question without an answer is left out (a marked answer never leaves
 * the loader).
 */
export function FaqBlock({
  id,
  eyebrow = 'Pytania',
  title,
  lead,
  items,
  aside,
  jsonLd = true,
}: Props) {
  const answered = items.filter((item): item is { question: string; answer: string } =>
    Boolean(item.answer),
  )
  if (answered.length === 0) return null
  return (
    <section
      id={id}
      aria-labelledby={`${id ?? 'faq'}-title`}
      className="bg-surface-2 py-[72px]"
      data-faq-block
    >
      {jsonLd && (
        <script
          type="application/ld+json"
          // Panel texts, serialized with `<` escaped (`serializeJsonLd`).
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd(answered)) }}
        />
      )}
      <div className="mx-auto grid max-w-[1344px] gap-10 px-5 min-[768px]:px-8 min-[1000px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="flex flex-col gap-3 min-[1000px]:sticky min-[1000px]:top-28 min-[1000px]:self-start">
          <p className="text-xs font-extrabold tracking-[0.12em] text-accent-text uppercase">
            {eyebrow}
          </p>
          <h2
            id={`${id ?? 'faq'}-title`}
            className="font-display text-[clamp(32px,3.8vw,48px)] leading-none font-extrabold tracking-[-0.025em]"
          >
            {title}
          </h2>
          {lead && <p className="text-ink-2">{lead}</p>}
          {aside}
        </div>
        <div className="flex flex-col gap-3">
          {answered.map((item, i) => (
            <details
              key={item.question}
              open={i === 0}
              className="group rounded-2xl border border-border bg-card open:border-accent-text"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 px-5 py-4 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text [&::-webkit-details-marker]:hidden">
                <span className="font-display text-sm font-extrabold text-accent-text">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1">{item.question}</span>
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-lg transition-transform group-open:rotate-45 group-open:border-accent group-open:bg-accent group-open:text-accent-ink"
                >
                  +
                </span>
              </summary>
              <p className="px-5 pb-5 pl-[52px] text-ink-2">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
