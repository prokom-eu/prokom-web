import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { BzAuditBlock as BzAuditBlockData } from '@/payload-types'

import { DaysUntil } from '../../components/DaysUntil'
import { Emphasis } from '@/components/Emphasis'
import { PageLink } from '../../components/PageLink'
import { auditSummary } from './summary'

type Props = { block: BzAuditBlockData; tenantId: number }

type State = NonNullable<BzAuditBlockData['report']['rows']>[number]['state']

// Whole class names, so Tailwind finds them.
// Status text in ink on a tint (coloured text on its own tint misses 4.5:1); colour in the dot.
const STATE: Record<State, { pill: string; dot: string }> = {
  urgent: { pill: 'bg-tone-red/12', dot: 'bg-tone-red' },
  fix: { pill: 'bg-warn/12', dot: 'bg-warn' },
  watch: { pill: 'bg-warn/12', dot: 'bg-warn' },
  term: { pill: 'bg-warn/12', dot: 'bg-warn' },
  ok: { pill: 'bg-ok/15', dot: 'bg-ok' },
}

const NEED_ICON = [
  'bg-accent-soft text-accent-text',
  'bg-tone-red/12 text-tone-red',
  'bg-warn/12 text-warn',
] as const

/**
 * Free IT audit `#przeglad` (spec. §6.4 pkt 5, plansza Dzial): why, steps, the CTA with the
 * line's phone and the guarantees; on the right a sample report. Its scan line, status pills
 * and stamp move in once (CSS), never with `prefers-reduced-motion`.
 */
export async function BzAuditBlock({ block, tenantId }: Props) {
  const settings = block.showPhone ? await getSiteSettings(tenantId) : null
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  const rows = block.report.rows ?? []
  const summary = auditSummary(rows)
  const { report } = block

  return (
    <section id="przeglad" aria-labelledby="przeglad-h" className="bg-surface-2 py-14 sm:py-24">
      <Container wide>
        <div className="grid items-center gap-12 overflow-hidden rounded-[36px] bg-card bg-[radial-gradient(ellipse_at_100%_0%,var(--glow),transparent_55%),radial-gradient(ellipse_at_0%_100%,color-mix(in_srgb,var(--ok)_12%,transparent),transparent_55%)] p-6 shadow-[0_40px_80px_-50px_var(--glow),inset_0_0_0_1px_var(--border)] sm:p-10 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] min-[1080px]:p-16">
          <div className="flex flex-col gap-6">
            {(block.badgeValue || block.badgeLabel) && (
              <p className="inline-flex items-center gap-2.5 self-start rounded-full bg-ok/12 py-1.5 pr-4 pl-1.5 text-[13px] font-extrabold tracking-[0.08em] text-ok-text uppercase">
                {block.badgeValue && (
                  <span className="rounded-full bg-ok-text px-2.5 py-1 text-[12px] text-surface">
                    {block.badgeValue}
                  </span>
                )}
                {block.badgeLabel}
              </p>
            )}
            <h2
              id="przeglad-h"
              className="font-display text-[clamp(2.2rem,4.4vw,3.8rem)] leading-[1.02] font-extrabold tracking-[-0.02em] font-stretch-110%"
            >
              {block.heading}
              {block.headingAccent && (
                <>
                  {' '}
                  <span className="text-h1-accent">{block.headingAccent}</span>
                </>
              )}
            </h2>
            {block.lead && (
              <p className="text-lg leading-relaxed text-ink-2">
                <Emphasis text={block.lead} />
              </p>
            )}

            {block.needs && block.needs.length > 0 && (
              <ul className="flex flex-col gap-2.5">
                {block.needs.map((need, i) => (
                  <li
                    key={need.id ?? i}
                    className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-[0_14px_30px_-24px_var(--glow),inset_0_0_0_1px_var(--border)]"
                  >
                    <span
                      aria-hidden="true"
                      className={cx(
                        'flex size-11 shrink-0 items-center justify-center rounded-xl',
                        NEED_ICON[i % NEED_ICON.length],
                      )}
                    >
                      <Icon name={need.icon} className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ink">{need.title}</span>
                      <span className="block text-[15px] leading-snug text-ink-2">{need.text}</span>
                    </span>
                    {need.countdownTo && (
                      <DaysUntil
                        date={need.countdownTo}
                        className="shrink-0 rounded-full bg-accent-text px-3 py-1.5 text-[13px] font-extrabold text-accent-ink"
                        fallback={null}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}

            {block.steps && block.steps.length > 0 && (
              <ol className="grid gap-5 pt-2 sm:grid-cols-3">
                {block.steps.map((step, i, all) => (
                  <li key={step.id ?? i} className="relative flex flex-col gap-1.5">
                    <span
                      aria-hidden="true"
                      className={cx(
                        'flex size-9 items-center justify-center rounded-full font-display text-sm font-extrabold',
                        i === all.length - 1
                          ? 'bg-ok-text text-surface'
                          : 'bg-card text-accent-text shadow-[inset_0_0_0_2px_var(--accent-text)]',
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="font-bold text-ink">{step.title}</span>
                    {step.text && (
                      <span className="text-[15px] leading-snug text-ink-3">{step.text}</span>
                    )}
                  </li>
                ))}
              </ol>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <PageLink href={block.cta.href} kind="ok" arrow>
                {block.cta.label}
              </PageLink>
              {phone && tel && (
                <a
                  href={tel}
                  className="inline-flex min-h-[52px] items-center gap-2.5 rounded-2xl bg-card px-6 font-extrabold text-ink shadow-[inset_0_0_0_1.5px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--ink-3)]"
                >
                  <Icon name="phone" className="size-[18px]" />
                  {phone}
                </a>
              )}
            </div>
            {block.guarantees && block.guarantees.length > 0 && (
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-bold text-ink-2">
                {block.guarantees.map((guarantee, i) => (
                  <li key={guarantee.id ?? i} className="inline-flex items-center gap-2">
                    <Icon name="check" strokeWidth={2.6} className="size-4 text-ok-text" />
                    {guarantee.text}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <figure
            aria-labelledby="przeglad-raport-h"
            className="relative mx-auto w-full max-w-[540px] min-[1080px]:rotate-[1.5deg]"
          >
            <div className="relative overflow-hidden rounded-[24px] bg-card p-5 text-ink shadow-[0_40px_80px_-30px_var(--glow),inset_0_0_0_1px_var(--border)] sm:p-6">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(to_bottom,transparent,color-mix(in_srgb,var(--accent-text)_10%,transparent),transparent)] motion-safe:animate-audit-scan motion-reduce:hidden"
              />
              {report.tag && (
                <span className="mb-3 inline-block rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-ink-2 sm:absolute sm:top-3 sm:right-3 sm:mb-0">
                  {report.tag}
                </span>
              )}
              {/* The title names the figure (`aria-labelledby`); a `figcaption` must be its direct child. */}
              <div className="border-b-2 border-ink pb-3">
                <span id="przeglad-raport-h" className="block font-display text-xl font-extrabold">
                  {report.title}
                </span>
                {report.subtitle && (
                  <span className="block text-[13px] text-ink-3">{report.subtitle}</span>
                )}
              </div>
              {rows.length > 0 && (
                <>
                  <dl className="mt-4 grid grid-cols-3 gap-2">
                    {(
                      [
                        ['urgent', 'pilne', 'text-tone-red'],
                        ['fix', 'do poprawy', 'text-warn'],
                        ['ok', 'w porządku', 'text-ok-text'],
                      ] as const
                    ).map(([key, label, color]) => (
                      <div
                        key={key}
                        className="flex flex-col-reverse rounded-xl bg-surface-2 px-3 py-2.5"
                      >
                        <dt className="text-[13px] font-bold text-ink-2">{label}</dt>
                        <dd className={cx('font-display text-xl font-extrabold', color)}>
                          {summary[key]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <ul className="mt-3 flex flex-col">
                    {rows.map((row, i) => (
                      <li
                        key={row.id ?? i}
                        className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0"
                      >
                        <span
                          aria-hidden="true"
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-2"
                        >
                          <Icon name={row.icon} className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14.5px] font-bold">{row.title}</span>
                          {row.detail && (
                            <span className="block text-[12.5px] text-ink-3">{row.detail}</span>
                          )}
                        </span>
                        <span
                          style={{ animationDelay: `${0.55 + i * 0.38}s` }}
                          className={cx(
                            'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-extrabold text-ink motion-safe:animate-audit-pop',
                            STATE[row.state].pill,
                          )}
                        >
                          <span
                            aria-hidden="true"
                            className={cx('size-1.5 rounded-full', STATE[row.state].dot)}
                          />
                          {row.stateLabel}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {(report.planTitle || report.signature || report.stamp) && (
                <div className="mt-3 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
                  {report.planTitle && (
                    <p className={cx('max-w-[30ch] text-[14px]', report.floatValue && 'sm:pl-20')}>
                      <b className="block font-bold">{report.planTitle}</b>
                      {report.planNote && (
                        <span className="text-[12.5px] text-ink-3">{report.planNote}</span>
                      )}
                    </p>
                  )}
                  <span className="flex flex-col items-end gap-1">
                    {report.signature && (
                      <span className="font-display text-lg font-extrabold text-accent-text italic">
                        {report.signature}
                      </span>
                    )}
                    {report.stamp && (
                      <span className="-rotate-[10deg] rounded-lg px-3 py-1 font-display text-lg font-extrabold tracking-[0.12em] text-ok-text uppercase shadow-[inset_0_0_0_2.5px_var(--ok-text)] motion-safe:animate-audit-stamp">
                        {report.stamp}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
            {report.floatValue && (
              // Decorative repeat of the „0 zł” guarantee; on a phone it would cover the stamp.
              <span className="absolute -bottom-8 -left-10 hidden size-32 flex-col items-center justify-center rounded-full bg-ok-text text-center text-surface shadow-[0_24px_50px_-18px_var(--ok),0_0_0_8px_color-mix(in_srgb,var(--ok)_14%,transparent)] sm:flex">
                <b className="font-display text-3xl leading-none font-extrabold sm:text-4xl">
                  {report.floatValue}
                </b>
                {report.floatText && (
                  <span className="mt-1 max-w-[10ch] text-xs leading-tight font-bold">
                    {report.floatText}
                  </span>
                )}
              </span>
            )}
          </figure>
        </div>
      </Container>
    </section>
  )
}
