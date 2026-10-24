import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type { BzMonitoringBlock as BzMonitoringBlockData } from '@/payload-types'

import { hasLink, PageLink } from '../../components/PageLink'

type State = NonNullable<BzMonitoringBlockData['panel']['rows']>[number]['state']

// Whole class names, so Tailwind finds them.
// Status text in ink on a tint (coloured text on its own tint misses 4.5:1); colour in the icon.
const STATE: Record<State, { pill: string; icon: string }> = {
  ok: { pill: 'bg-ok/15 text-ink', icon: 'bg-ok/12 text-ok-text' },
  planned: { pill: 'bg-accent-soft text-ink', icon: 'bg-accent-soft text-accent-text' },
  wip: { pill: 'bg-warn/15 text-ink', icon: 'bg-warn/12 text-warn' },
}

const DOT = 'size-2 shrink-0 rounded-full motion-safe:animate-pulse'

/**
 * „Widzimy problemy, zanim Ty je zauważysz” (spec. §6.4 pkt 2, plansza Dzial): a navy block with
 * the text, points and buttons, and the sample care panel — an illustration from panel texts,
 * labelled as such („Panel poglądowy…”).
 */
export function BzMonitoringBlock({ block }: { block: BzMonitoringBlockData }) {
  const { panel } = block
  const headingId = `monitoring-${block.id ?? 'sekcja'}-h`
  return (
    <section aria-labelledby={headingId} className="py-6 sm:py-10">
      <Container wide>
        <div
          data-surface="dark"
          className="grid items-center gap-10 overflow-hidden rounded-[36px] bg-surface-dark bg-[radial-gradient(ellipse_at_80%_0%,color-mix(in_srgb,var(--accent-on-dark)_22%,transparent),transparent_60%)] p-6 text-white sm:p-10 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] min-[1080px]:p-14"
        >
          <div className="flex flex-col gap-6">
            {block.eyebrow && (
              <p className="text-[13px] font-extrabold tracking-[0.08em] text-accent-on-dark uppercase">
                {block.eyebrow}
              </p>
            )}
            <h2
              id={headingId}
              className="font-display text-[clamp(2.1rem,4.2vw,3.6rem)] leading-[1.02] font-extrabold tracking-[-0.02em] font-stretch-110%"
            >
              {block.heading}
            </h2>
            {block.text && (
              <p className="max-w-[52ch] text-lg leading-relaxed text-white/80">{block.text}</p>
            )}
            {block.points && block.points.length > 0 && (
              <ul className="flex flex-col gap-3">
                {block.points.map((point, i) => (
                  <li
                    key={point.id ?? i}
                    className="flex items-center gap-3.5 text-[17px] font-bold"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-accent-on-dark"
                    >
                      <Icon name={point.icon} className="size-5" />
                    </span>
                    {point.text}
                  </li>
                ))}
              </ul>
            )}
            {(hasLink(block.primary) || hasLink(block.secondary)) && (
              <div className="flex flex-wrap gap-3 pt-2">
                {hasLink(block.primary) && (
                  <PageLink href={block.primary.href} kind="light">
                    {block.primary.label}
                  </PageLink>
                )}
                {hasLink(block.secondary) && (
                  <PageLink href={block.secondary.href} kind="outlineDark" arrow>
                    {block.secondary.label}
                  </PageLink>
                )}
              </div>
            )}
          </div>

          <figure className="rounded-[26px] bg-card text-ink shadow-[0_40px_80px_-40px_var(--surface-dark)]">
            <div className="flex items-center gap-3 border-b border-border p-5">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-text text-accent-ink"
              >
                <Icon name="shield" className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{panel.title}</span>
                {panel.subtitle && (
                  <span className="block text-[13px] text-ink-3">{panel.subtitle}</span>
                )}
              </span>
              {panel.status && (
                <span className="inline-flex items-center gap-2 rounded-full bg-ok/15 px-3 py-1.5 text-[13px] font-extrabold text-ink">
                  <span aria-hidden="true" className={cx(DOT, 'bg-ok')} />
                  {panel.status}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-4 p-5">
              {panel.kpis && panel.kpis.length > 0 && (
                <dl className="grid gap-2.5 min-[480px]:grid-cols-3">
                  {panel.kpis.map((kpi, i) => (
                    <div key={kpi.id ?? i} className="rounded-2xl bg-surface-2 p-3.5">
                      <dt className="text-[11.5px] font-bold tracking-[0.06em] text-ink-2 uppercase">
                        {kpi.label}
                      </dt>
                      <dd className="mt-1 font-display text-xl font-extrabold">{kpi.value}</dd>
                      <span aria-hidden="true" className="mt-2.5 block h-1 rounded-full bg-ok" />
                    </div>
                  ))}
                </dl>
              )}
              {panel.rows && panel.rows.length > 0 && (
                <ul className="flex flex-col">
                  {panel.rows.map((row, i) => (
                    <li
                      key={row.id ?? i}
                      className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0"
                    >
                      <span
                        aria-hidden="true"
                        className={cx(
                          'flex size-9 shrink-0 items-center justify-center rounded-full',
                          STATE[row.state].icon,
                        )}
                      >
                        <Icon name={row.icon} className="size-[18px]" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-bold">{row.title}</span>
                        {row.detail && (
                          <span className="block text-[13px] text-ink-3">{row.detail}</span>
                        )}
                      </span>
                      <span
                        className={cx(
                          'shrink-0 rounded-lg px-2.5 py-1 text-[12.5px] font-extrabold',
                          STATE[row.state].pill,
                        )}
                      >
                        {row.stateLabel}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {panel.log && panel.log.length > 0 && (
                <div
                  data-surface="dark"
                  className="rounded-2xl bg-surface-dark p-4 text-[13.5px] text-white"
                >
                  {panel.logLabel && (
                    <p className="mb-2 inline-flex items-center gap-2 text-[11.5px] font-extrabold tracking-[0.1em] text-accent-on-dark uppercase">
                      <span aria-hidden="true" className={cx(DOT, 'bg-tone-red')} />
                      {panel.logLabel}
                    </p>
                  )}
                  <ul className="flex flex-col gap-1.5">
                    {panel.log.map((entry, i) => (
                      <li key={entry.id ?? i} className="flex gap-3">
                        <span className="text-white/60 tabular-nums">{entry.time}</span>
                        <span>{entry.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {panel.note && (
              <figcaption className="px-5 pb-5 text-xs text-ink-3">{panel.note}</figcaption>
            )}
          </figure>
        </div>
      </Container>
    </section>
  )
}
