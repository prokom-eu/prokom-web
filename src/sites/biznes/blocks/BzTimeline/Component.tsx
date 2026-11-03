import type { CSSProperties } from 'react'

import { Container } from '@/components/ui/Container'
import type { BzTimelineBlock as BzTimelineBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'

const TONE = {
  // GoPOS green (plansza Gopos).
  ok: {
    eyebrow: 'text-ok-text',
    line: 'from-ok to-accent-text',
    circle: 'text-ok-text shadow-[inset_0_0_0_2.5px_var(--ok)]',
  },
  // The Biznes accent (plansza Branza).
  accent: {
    eyebrow: 'text-accent-text',
    line: 'from-accent-text to-accent-text',
    circle: 'text-accent-text shadow-[inset_0_0_0_2.5px_var(--accent-text)]',
  },
} as const

type Props = { block: BzTimelineBlockData; tone?: keyof typeof TONE }

/**
 * Steps on a line (plansza Gopos „Od prezentacji do pierwszego sezonu”, green); the industry page
 * passes the accent tone and steps with hours (plansza Branza „Dzień w lokalu”).
 */
export function BzTimelineBlock({ block, tone = 'ok' }: Props) {
  const colors = TONE[tone]
  const headingId = `kroki-${block.id ?? 'sekcja'}-h`
  return (
    <section aria-labelledby={headingId} className="py-14 max-md:py-7 sm:py-20">
      <Container wide>
        <SectionHead
          id={headingId}
          eyebrow={block.eyebrow}
          heading={block.heading}
          eyebrowClassName={colors.eyebrow}
          appOnPhone
        />
        <div className="relative mt-10 max-md:mt-4">
          <span
            aria-hidden="true"
            className={`absolute top-7 right-0 left-7 hidden h-0.5 bg-linear-90 ${colors.line} min-[1080px]:block`}
          />
          <ol
            // One column per step on a computer (2–6 steps), as on the board.
            style={{ '--steps': block.steps.length } as CSSProperties}
            // Phone (App-Branza „Dzień w lokalu”): rows — the hour on the left, the text right.
            className="relative grid gap-8 max-md:gap-0 max-md:divide-y max-md:divide-border min-[640px]:grid-cols-2 min-[1080px]:grid-cols-[repeat(var(--steps),minmax(0,1fr))]"
          >
            {block.steps.map((step, i) => (
              <li
                key={step.id ?? i}
                className="relative flex flex-col gap-2 pr-4 max-md:grid max-md:grid-cols-[3.25rem_minmax(0,1fr)] max-md:gap-x-3 max-md:gap-y-0.5 max-md:py-3 max-md:pr-0"
              >
                <span
                  aria-hidden="true"
                  className={`flex size-14 items-center justify-center rounded-full bg-surface font-display font-extrabold ${colors.circle} ${step.label ? 'text-[15px]' : 'text-lg'} max-md:row-span-2 max-md:size-auto max-md:justify-start max-md:self-start max-md:rounded-none max-md:bg-transparent max-md:text-sm max-md:shadow-none max-md:ring-0`}
                >
                  {step.label || i + 1}
                </span>
                <h3 className="mt-3 text-lg font-bold text-ink max-md:mt-0 max-md:text-[15px]">
                  {step.label && <span className="sr-only">{step.label} — </span>}
                  {step.title}
                </h3>
                {step.text && (
                  <p className="text-[15px] leading-snug text-ink-2 max-md:text-[13px]">
                    {step.text}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
