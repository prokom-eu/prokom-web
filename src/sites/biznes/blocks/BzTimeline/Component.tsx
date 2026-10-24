import type { CSSProperties } from 'react'

import { Container } from '@/components/ui/Container'
import type { BzTimelineBlock as BzTimelineBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'

/** Numbered steps on a green line (plansza Gopos „Od prezentacji do pierwszego sezonu”). */
export function BzTimelineBlock({ block }: { block: BzTimelineBlockData }) {
  const headingId = `kroki-${block.id ?? 'sekcja'}-h`
  return (
    <section aria-labelledby={headingId} className="py-14 sm:py-20">
      <Container wide>
        <SectionHead
          id={headingId}
          eyebrow={block.eyebrow}
          heading={block.heading}
          eyebrowClassName="text-ok-text"
        />
        <div className="relative mt-10">
          <span
            aria-hidden="true"
            className="absolute top-7 right-0 left-7 hidden h-0.5 bg-linear-90 from-ok to-accent-text min-[1080px]:block"
          />
          <ol
            // One column per step on a computer (2–6 steps), as on the board.
            style={{ '--steps': block.steps.length } as CSSProperties}
            className="relative grid gap-8 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-[repeat(var(--steps),minmax(0,1fr))]"
          >
            {block.steps.map((step, i) => (
              <li key={step.id ?? i} className="relative flex flex-col gap-2 pr-4">
                <span
                  aria-hidden="true"
                  className="flex size-14 items-center justify-center rounded-full bg-surface font-display text-lg font-extrabold text-ok-text shadow-[inset_0_0_0_2.5px_var(--ok)]"
                >
                  {i + 1}
                </span>
                <h3 className="mt-3 text-lg font-bold text-ink">{step.title}</h3>
                {step.text && <p className="text-[15px] leading-snug text-ink-2">{step.text}</p>}
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
