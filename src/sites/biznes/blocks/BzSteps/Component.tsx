import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import type { BzStepsBlock as BzStepsBlockData } from '@/payload-types'

import { SectionHead } from '../../components/home/SectionHead'

/**
 * „Jak pracujemy” (spec. §4 pkt 7): four steps on a line, each with what you get and who does
 * it. People as role icons, not photos (decision 15.10: no own photos on Biznes).
 */
export function BzStepsBlock({ block }: { block: BzStepsBlockData }) {
  const guarantees = block.guarantees ?? []
  return (
    <section id="jak-pracujemy" aria-labelledby="jak-pracujemy-h" className="py-16 sm:py-24">
      <Container wide>
        <SectionHead
          id="jak-pracujemy-h"
          eyebrow={block.eyebrow}
          heading={block.heading}
          lead={block.lead}
        />
        <div className="relative mt-12">
          {/* The line joining the step icons (desktop). */}
          <span
            aria-hidden="true"
            className="absolute top-[38px] right-[12.5%] left-[12.5%] hidden h-[3px] rounded-full bg-surface-3 min-[1080px]:block"
          />
          <ol className="relative grid gap-4 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
            {block.steps.map((step, i) => (
              <li key={step.id ?? i} className="relative flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className="relative z-[1] flex size-[76px] items-center justify-center rounded-[22px] bg-card text-accent-text shadow-[0_18px_36px_-24px_var(--glow),inset_0_0_0_1px_var(--border)]"
                >
                  <Icon name={step.icon} className="size-7" />
                  <span className="absolute -top-2.5 -right-2.5 flex size-7 items-center justify-center rounded-full bg-accent-text font-display text-[13px] font-extrabold text-accent-ink shadow-[0_0_0_3px_var(--surface)]">
                    {i + 1}
                  </span>
                </span>
                <div className="mt-4 flex w-full flex-1 flex-col rounded-[22px] bg-card p-5 shadow-[inset_0_0_0_1px_var(--border)]">
                  <h3 className="font-display text-xl leading-tight font-extrabold">
                    <span className="sr-only">Krok {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{step.text}</p>
                  {step.gets && (
                    <p className="mt-auto rounded-2xl bg-accent-soft px-3.5 py-3 text-sm leading-snug text-ink">
                      {block.getsLabel && (
                        <span className="block text-[11px] font-extrabold tracking-[0.12em] text-ink-2 uppercase">
                          {block.getsLabel}
                        </span>
                      )}
                      {step.gets}
                    </p>
                  )}
                  {step.role && (
                    <div className="mt-4 flex items-center gap-3 border-t border-dashed border-border pt-4">
                      <span
                        aria-hidden="true"
                        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-text text-accent-ink"
                      >
                        <Icon name="users" className="size-5" />
                      </span>
                      <span className="flex flex-col">
                        <span className="font-extrabold text-ink">{step.role}</span>
                        {step.roleNote && (
                          <span className="text-[13px] text-ink-3">{step.roleNote}</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
        {guarantees.length > 0 && (
          <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
            {guarantees.map((guarantee, i) => (
              <li
                key={guarantee.id ?? i}
                className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2.5 text-[15px] font-extrabold text-ink shadow-[inset_0_0_0_1px_var(--border)]"
              >
                <Icon name="check" strokeWidth={2.4} className="size-4 text-ok-text" />
                {guarantee.text}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  )
}
