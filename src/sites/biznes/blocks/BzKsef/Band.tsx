import { Container } from '@/components/ui/Container'
import { deadlineText, ksefPhase } from '@/lib/biznes/ksefBand'
import { getSiteSettings } from '@/lib/site/data'
import type { BzKsefBlock as BzKsefBlockData } from '@/payload-types'
import { BZ_H2 } from '@/sites/biznes/typography'

import { PageLink } from '../../components/PageLink'
import { KsefCountdown } from './KsefCountdownLazy'

const DEFAULT_LABEL = 'Przygotuj firmę do KSeF'

/**
 * The KSeF band of the home page (plan 0611 §7.1 pkt 7, prototype `#ksef`): the deadline,
 * headings and link from `SiteSettings → Biznes → KSeF`, the countdown in the browser and the six
 * steps from the block's checklist. No deadline in the panel = no band. From the deadline day on
 * the heading „after” shows and the countdown goes (K36 §3).
 */
export async function BzKsefBand({
  block,
  tenantId,
}: {
  block: BzKsefBlockData
  tenantId: number
}) {
  const ksef = (await getSiteSettings(tenantId))?.biznes?.ksef ?? null
  if (!ksef) return null
  const before = ksefPhase(ksef.deadline, new Date()) === 'before'
  // Without the panel text a fixed heading — not the eyebrow, which would then show twice.
  const heading = (before ? ksef.textBefore : ksef.textAfter) ?? 'Przygotuj firmę do KSeF'
  const date = deadlineText(ksef.deadline)
  const steps = (block.checklist ?? []).slice(0, 6)
  return (
    <section
      id="ksef"
      aria-labelledby="ksef-h"
      className="scroll-mt-24 py-6 sm:py-10"
      data-ksef-band={before ? 'before' : 'after'}
    >
      <Container wide>
        <div
          data-surface="dark"
          className="grid items-center gap-6 overflow-hidden rounded-[30px] bg-surface-dark bg-[radial-gradient(60%_90%_at_100%_50%,color-mix(in_srgb,var(--ok)_35%,transparent),transparent_70%),radial-gradient(40%_60%_at_0%_0%,color-mix(in_srgb,var(--accent-on-dark)_30%,transparent),transparent_70%)] px-5 py-6 text-white sm:gap-9 sm:px-11 sm:py-10 min-[1080px]:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
        >
          <div className="flex flex-col gap-3">
            {block.eyebrow && (
              <p className="text-[13px] font-extrabold tracking-[0.08em] text-accent-on-dark uppercase">
                {block.eyebrow}
              </p>
            )}
            <h2 id="ksef-h" className={`${BZ_H2} text-white`}>
              {heading}
            </h2>
            {block.text && (
              <p className="max-w-[36em] leading-relaxed text-white/80">{block.text}</p>
            )}
            <PageLink href={ksef.href} kind="light" arrow className="mt-3 self-start">
              {block.link?.label || DEFAULT_LABEL}
            </PageLink>
          </div>
          <div className="flex flex-col gap-3.5">
            {before && (
              <>
                {date && (
                  <p className="text-sm font-bold text-white/80">
                    Do terminu: <time dateTime={ksef.deadline}>{date}</time>
                  </p>
                )}
                <KsefCountdown deadline={ksef.deadline} />
              </>
            )}
            {steps.length > 0 && (
              <ol
                aria-label="Kroki przygotowania do KSeF"
                className="grid gap-2 min-[640px]:grid-cols-2"
              >
                {steps.map((step, i) => (
                  <li
                    key={step.id ?? i}
                    className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-3.5 py-2.5 text-[14.5px] font-bold ring-1 ring-white/12 ring-inset"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/12 text-[13px] tabular-nums"
                    >
                      {i + 1}
                    </span>
                    {step.title}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
