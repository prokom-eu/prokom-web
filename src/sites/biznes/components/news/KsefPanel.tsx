import { Container } from '@/components/ui/Container'
import type { KsefPanel as KsefPanelData } from '@/lib/posts/ksefPanel'
import { daysUntil } from '@/lib/site/days'

import { DayCount } from '../../blocks/BzKsef/DayCount'
import { PageLink } from '../PageLink'

/**
 * The KSeF panel above the news list (board `Aktualnosci`), from the Biznes settings: the days
 * to the date (counted in the browser, like `bzKsef`), what it means, two buttons, the numbered
 * steps and the legal note. After the date the counter goes and the label is the heading.
 */
export function KsefPanel({ panel }: { panel: KsefPanelData }) {
  const counting = daysUntil(panel.date, new Date()) !== null
  return (
    <section id="ksef" aria-labelledby="ksef-h" className="scroll-mt-24 pb-6 sm:pb-10">
      <Container wide>
        <div
          data-surface="dark"
          className="overflow-hidden rounded-[36px] bg-surface-dark bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--accent-on-dark)_26%,transparent),transparent_55%)] p-6 text-white sm:p-10 min-[1080px]:p-[72px]"
        >
          <div className="grid items-center gap-8 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] min-[1080px]:gap-14">
            <div className="flex flex-col">
              {counting ? (
                <>
                  {panel.eyebrow && (
                    <p className="text-[17px] font-extrabold text-accent-on-dark">
                      {panel.eyebrow}
                    </p>
                  )}
                  <h2 id="ksef-h" className="flex flex-col">
                    <DayCount
                      date={panel.date}
                      className="bg-linear-to-b from-white to-accent-on-dark bg-clip-text font-display text-[clamp(6rem,13vw,10.5rem)] leading-[0.9] font-extrabold tracking-[-0.04em] text-transparent tabular-nums font-stretch-112%"
                    />
                    <span className="mt-3 text-[clamp(1.5rem,2.4vw,2rem)] font-extrabold">
                      {panel.dateLabel}
                    </span>
                  </h2>
                </>
              ) : (
                <h2
                  id="ksef-h"
                  className="font-display text-[clamp(1.8rem,3vw,2.4rem)] leading-tight font-extrabold"
                >
                  {panel.eyebrow || 'KSeF'}
                </h2>
              )}
            </div>
            <div className="flex flex-col gap-6">
              {panel.text && <p className="text-lg leading-relaxed text-white/80">{panel.text}</p>}
              {(panel.link || panel.secondaryLink) && (
                <div className="flex flex-wrap gap-3">
                  {panel.link && (
                    <PageLink href={panel.link.href} kind="light">
                      {panel.link.label}
                    </PageLink>
                  )}
                  {panel.secondaryLink && (
                    <PageLink href={panel.secondaryLink.href} kind="outlineDark">
                      {panel.secondaryLink.label}
                    </PageLink>
                  )}
                </div>
              )}
            </div>
          </div>
          {panel.steps.length > 0 && (
            <ol className="mt-10 grid gap-3 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-3">
              {panel.steps.map((step, position) => (
                <li
                  key={position}
                  className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 ring-inset"
                >
                  <span
                    aria-hidden="true"
                    className="text-[13px] font-extrabold tracking-[0.08em] text-accent-on-dark tabular-nums"
                  >
                    {String(position + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-1.5 block text-lg font-bold">{step.title}</span>
                  {step.text && (
                    <span className="mt-1 block text-[14px] leading-snug text-white/75">
                      {step.text}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          )}
          {panel.note && (
            <p className="mt-6 text-[13px] leading-relaxed text-white/65">{panel.note}</p>
          )}
        </div>
      </Container>
    </section>
  )
}
