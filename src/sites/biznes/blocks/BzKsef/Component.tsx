import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { daysUntil } from '@/lib/site/days'
import type { BzKsefBlock as BzKsefBlockData } from '@/payload-types'

import { hasLink, PageLink } from '../../components/PageLink'
import { DayCount } from './DayCount'

/**
 * KSeF with a day counter (spec. §6.6 pkt 4, plansza Insert), `#ksef`: a navy card with the big
 * number of days, what the date means, an optional button and the things to prepare. Once the
 * day has passed the counter goes and the label above becomes the heading.
 */
export function BzKsefBlock({ block }: { block: BzKsefBlockData }) {
  const counting = daysUntil(block.date, new Date()) !== null
  return (
    <section id="ksef" aria-labelledby="ksef-h" className="scroll-mt-24 py-6 sm:py-10">
      <Container wide>
        <div
          data-surface="dark"
          className="grid items-center gap-10 overflow-hidden rounded-[36px] bg-surface-dark bg-[radial-gradient(ellipse_at_45%_0%,color-mix(in_srgb,var(--accent-on-dark)_26%,transparent),transparent_55%)] p-6 text-white sm:p-10 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] min-[1080px]:p-14"
        >
          <div className="flex flex-col gap-4">
            {counting ? (
              <>
                {block.eyebrow && (
                  <p className="text-[13px] font-extrabold tracking-[0.08em] text-accent-on-dark uppercase">
                    {block.eyebrow}
                  </p>
                )}
                <h2 id="ksef-h" className="flex flex-col">
                  <DayCount
                    date={block.date}
                    className="font-display text-[clamp(5rem,10vw,8rem)] leading-[0.9] font-extrabold tracking-[-0.03em] tabular-nums font-stretch-112%"
                  />
                  <span className="mt-2 text-2xl font-bold">{block.dateLabel}</span>
                </h2>
              </>
            ) : (
              <h2
                id="ksef-h"
                className="font-display text-[clamp(1.8rem,3vw,2.4rem)] leading-tight font-extrabold"
              >
                {block.eyebrow || 'KSeF'}
              </h2>
            )}
            {block.text && (
              <p className="max-w-[56ch] text-lg leading-relaxed text-white/80">{block.text}</p>
            )}
            {hasLink(block.link) && (
              <PageLink href={block.link.href} kind="light" arrow className="self-start">
                {block.link.label}
              </PageLink>
            )}
          </div>
          {block.checklist && block.checklist.length > 0 && (
            <ul className="grid gap-3 min-[640px]:grid-cols-2">
              {block.checklist.map((item, i) => (
                <li
                  key={item.id ?? i}
                  className="flex gap-3 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/12 ring-inset"
                >
                  <Icon name="check" strokeWidth={2.6} className="mt-0.5 size-4 shrink-0 text-ok" />
                  <span>
                    <span className="block font-bold">{item.title}</span>
                    {item.text && (
                      <span className="block text-[14px] leading-snug text-white/75">
                        {item.text}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  )
}
