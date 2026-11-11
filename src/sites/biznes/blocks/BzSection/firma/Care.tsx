import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { Icon } from '@/components/ui/Icon'
import { cx } from '@/components/ui/cx'
import type { SectionData } from '@/lib/biznes/pages/sections'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'
import { BZ_H1, BZ_LEAD } from '@/sites/biznes/typography'

import { Breadcrumbs, type Crumb } from '../../../components/Breadcrumbs'
import { AddActionButton } from '../AddActionButton'
import { productsBySlug } from '../common/Products'
import { BTN, BTN_ON_DARK, BTN_PRIMARY, CARD, EYEBROW, SectionShell, withTrail } from '../ui'

const TONE: Record<SectionData<'care-hero'>['report']['rows'][number]['tone'], string> = {
  ok: 'bg-ok/15 text-ok-text',
  warn: 'bg-promo/25 text-ink',
  urgent: 'bg-tone-red/18 text-ink',
  due: 'bg-accent-text/12 text-h1-accent',
}

/**
 * Opieka IT hero (K34 §6, plansza Web-Opieka): pill, H1 with the accented part, lead,
 * „Umów bezpłatny przegląd IT” and the phone from the panel, three figures; on the right the
 * sample report of an IT review. No price model and no „abonament” (K4-FINAL §1).
 */
export async function CareHero({
  block,
  data,
  crumbs,
  tenantId,
}: {
  block: BzSectionData
  data: SectionData<'care-hero'>
  crumbs: readonly Crumb[]
  tenantId: number
}) {
  const settings = await getSiteSettings(tenantId)
  const phone = settings?.phone ?? null
  const tel = phone ? toTelHref(phone) : null
  return (
    <section
      id={block.anchor || undefined}
      aria-labelledby="opieka-h"
      className="scroll-mt-28 pt-6 pb-14 sm:pt-8 sm:pb-20"
    >
      <Container wide>
        <div className="mb-7 max-md:hidden">
          <Breadcrumbs items={withTrail(crumbs, data.trail)} />
        </div>
        {/* Board `Web-opieka-it` (prompt 2 W3): the hero in a dark card, the report on the right. */}
        <div
          data-surface="dark"
          className="grid items-center gap-10 overflow-hidden rounded-[32px] bg-surface-dark bg-[radial-gradient(110%_120%_at_0%_0%,color-mix(in_srgb,var(--accent-text)_38%,transparent),transparent_55%)] p-6 text-white sm:p-10 min-[1080px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] min-[1080px]:px-12 min-[1080px]:py-14"
        >
          <div className="flex flex-col gap-6">
            <p
              className={cx(
                EYEBROW,
                'inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3.5 py-2 text-white ring-1 ring-white/20',
              )}
            >
              <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
              {data.pill}
            </p>
            <h1 id="opieka-h" className={BZ_H1}>
              {block.heading || crumbs.at(-1)?.name}{' '}
              {block.headingAccent && <em className="text-ok not-italic">{block.headingAccent}</em>}
            </h1>
            {block.lead && (
              <p className={`${BZ_LEAD} max-w-[58ch] text-pretty text-white/80`}>{block.lead}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <AddActionButton
                slug={data.review.slug}
                label={data.review.label}
                note={data.review.note}
                className={cx(BTN, 'bg-white text-surface-dark hover:bg-accent-on-dark')}
              />
              {phone && tel && (
                <a href={tel} className={BTN_ON_DARK}>
                  {phone}
                </a>
              )}
            </div>
            <dl className="grid grid-cols-3 gap-4 border-t border-white/15 pt-5">
              {data.stats.map((stat) => (
                <div key={stat.k} className="flex flex-col-reverse gap-1">
                  <dt className="text-[14px] leading-snug text-white/75">{stat.k}</dt>
                  <dd className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-none font-extrabold">
                    {stat.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <figure
            className={cx(
              CARD,
              'flex flex-col gap-4 p-5 text-ink shadow-[0_30px_60px_-40px_var(--glow),inset_0_0_0_1px_var(--border)] sm:p-6',
            )}
          >
            <figcaption className="flex items-start justify-between gap-3">
              <span className="flex flex-col">
                <b className="font-display text-lg font-extrabold">{data.report.title}</b>
                <small className="text-[14px] text-ink-2">{data.report.sub}</small>
              </span>
              <em className="rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-extrabold text-ink-2 not-italic">
                przykład
              </em>
            </figcaption>
            <ul className="flex flex-col divide-y divide-border">
              {data.report.rows.map((row) => (
                <li key={row.t} className="flex items-center gap-3 py-2.5">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <b className="text-[15px] font-extrabold">{row.t}</b>
                    <small className="text-[13.5px] text-ink-2">{row.d}</small>
                  </span>
                  <em
                    className={cx(
                      'shrink-0 rounded-full px-2.5 py-1 text-[12px] font-extrabold not-italic',
                      TONE[row.tone],
                    )}
                  >
                    {row.s}
                  </em>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-4 rounded-2xl bg-surface-dark p-4 text-white">
              <b className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 font-display text-2xl">
                {data.report.summary.n}
              </b>
              <span className="flex flex-col">
                <b className="font-extrabold">{data.report.summary.t}</b>
                <small className="text-[14px] text-white/80">{data.report.summary.d}</small>
              </span>
            </div>
            <ul className="flex flex-wrap gap-2">
              {data.report.badges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-full bg-surface-2 px-3 py-1.5 text-[13px] font-bold text-ink-2"
                >
                  {badge}
                </li>
              ))}
            </ul>
          </figure>
        </div>
      </Container>
    </section>
  )
}

/** „Dla kogo”: kinds of firms with what we look after, a product picture each. */
export function Audience({
  block,
  data,
  index,
}: {
  block: BzSectionData
  data: SectionData<'audience'>
  index: CatalogIndex
}) {
  return (
    <SectionShell block={block}>
      <ul className="grid gap-4 max-md:gap-2.5 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
        {data.items.map((item) => {
          const [product] = item.image ? productsBySlug(index, [item.image]) : []
          return (
            <li key={item.t} className={cx(CARD, 'flex flex-col gap-2 p-5 text-ink max-md:p-4')}>
              {product?.image && (
                <span className="mb-2 flex h-28 items-center justify-center rounded-2xl bg-surface-2 p-3 max-md:hidden">
                  <Image
                    unoptimized
                    src={product.image.url}
                    alt={product.name}
                    width={product.image.width}
                    height={product.image.height}
                    className="max-h-full w-auto object-contain"
                  />
                </span>
              )}
              <b className="font-display text-lg leading-tight font-extrabold">{item.t}</b>
              <small className="text-[14px] text-ink-2">{item.k}</small>
              <ul className="mt-1 flex flex-col gap-1.5">
                {item.l.map((line) => (
                  <li key={line} className="flex gap-2 text-[15px] text-ink-2">
                    <span aria-hidden="true" className="text-ok-text">
                      ✓
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </SectionShell>
  )
}

/** „Na start” and „Terminy”: two cards side by side. */
export function StartCalendar({
  block,
  data,
}: {
  block: BzSectionData
  data: SectionData<'start-calendar'>
}) {
  return (
    <SectionShell block={block}>
      <div className="grid gap-5 min-[1080px]:grid-cols-2">
        {/* Web-opieka-it (PREMIUM-1011): „Na start” as a navy panel with tiles 2 × 3; on a phone
            one column (App-Opieka). The calendar card next to it stays light. */}
        <div
          data-surface="dark"
          className="relative isolate flex flex-col gap-4 overflow-hidden rounded-[22px] bg-surface-dark p-6 text-white max-md:gap-3 max-md:p-[18px] sm:p-7"
          data-start-panel
        >
          <p className={cx(EYEBROW, 'text-on-dark-text')}>{data.start.eyebrow}</p>
          <h3 className="font-display text-[1.5rem] leading-tight font-extrabold">
            {data.start.heading}
          </h3>
          <ol className="grid gap-2.5 min-[560px]:grid-cols-2" data-reveal-cards="">
            {data.start.items.map((item, i) => (
              <li
                key={item.t}
                className="flex gap-3 rounded-[18px] bg-white/[0.06] p-4 ring-1 ring-white/12 max-md:p-3"
              >
                <i className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/12 font-display font-extrabold text-white not-italic">
                  {i + 1}
                </i>
                <span className="flex flex-col">
                  <b className="font-extrabold">{item.t}</b>
                  <small className="text-[14px] leading-relaxed text-white/75 max-md:text-[13px]">
                    {item.d}
                  </small>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className={cx(CARD, 'flex flex-col gap-4 p-6 text-ink max-md:hidden sm:p-7')}>
          <p className={cx(EYEBROW, 'text-accent-text')}>{data.calendar.eyebrow}</p>
          <h3 className="font-display text-[1.5rem] leading-tight font-extrabold">
            {data.calendar.heading}
          </h3>
          <ul className="flex flex-col gap-2.5">
            {data.calendar.items.map((item) => (
              <li
                key={`${item.m}-${item.t}`}
                className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3"
              >
                <em className="flex h-11 w-14 shrink-0 items-center justify-center rounded-xl bg-card font-display text-[14px] font-extrabold text-accent-text not-italic">
                  {item.m}
                </em>
                <span className="flex flex-col">
                  <b className="font-extrabold">{item.t}</b>
                  <small className="text-[14px] text-ink-2">{item.d}</small>
                </span>
              </li>
            ))}
          </ul>
          {data.calendar.note && <p className="text-[13px] text-ink-2">{data.calendar.note}</p>}
        </div>
      </div>
    </SectionShell>
  )
}

/**
 * „Bezpłatny przegląd IT” (#przeglad-it, PREMIUM-1011): on the left the eight areas we check, on
 * the right a sample of the written report in the hero's status colours, then „Umów przegląd”
 * (puts the review on the inquiry list) with the short facts. No price, no subscription.
 */
export function CareReview({
  block,
  data,
}: {
  block: BzSectionData
  data: SectionData<'care-review'>
}) {
  return (
    <SectionShell block={block}>
      <div className="grid gap-5 min-[1080px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className={cx(CARD, 'flex flex-col gap-4 p-6 text-ink sm:p-7')}>
          <h3 className="font-display text-[1.3rem] leading-tight font-extrabold">Co sprawdzamy</h3>
          <ul className="grid gap-2.5 min-[560px]:grid-cols-2" data-review-checks>
            {data.checks.map((check) => (
              <li key={check} className="flex items-start gap-2.5">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ok/15 text-ok-text"
                >
                  <Icon name="check" className="size-3.5" strokeWidth={2.6} />
                </span>
                <span className="font-bold">{check}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={cx(CARD, 'flex flex-col gap-4 p-6 text-ink sm:p-7')}>
          <h3 className="font-display text-[1.3rem] leading-tight font-extrabold">Co dostajesz</h3>
          <div className="rounded-[18px] bg-surface-2 p-4" data-review-report>
            <p className="flex items-center gap-2 text-[14px] font-extrabold">
              <Icon name="doc" className="size-4 text-accent-text" />
              {data.report.title}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {data.report.rows.map((row) => (
                <li
                  key={row.t}
                  className="flex items-center justify-between gap-3 rounded-xl bg-card px-3 py-2.5"
                >
                  <span className="flex flex-col">
                    <b className="text-[15px] font-extrabold">{row.t}</b>
                    <small className="text-[13px] text-ink-2">{row.d}</small>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cx('size-3 shrink-0 rounded-full', DOT[row.tone])}
                  />
                </li>
              ))}
            </ul>
            {data.report.foot && <p className="mt-3 text-[13px] text-ink-2">{data.report.foot}</p>}
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3">
            <AddActionButton
              slug={data.slug}
              label={data.label}
              note={data.note}
              className={BTN_PRIMARY}
            />
            {data.facts.length > 0 && (
              <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[14px] font-bold text-ink-2">
                {data.facts.map((fact) => (
                  <li key={fact} className="inline-flex items-center gap-1">
                    <Icon name="check" className="size-3.5 text-ok-text" strokeWidth={2.6} />
                    {fact}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}

/** The status dot of a report row: the hero report's colours (`TONE`), as solid dots. */
const DOT: Record<SectionData<'care-review'>['report']['rows'][number]['tone'], string> = {
  ok: 'bg-ok',
  warn: 'bg-promo',
  urgent: 'bg-tone-red',
  due: 'bg-accent-text',
}
