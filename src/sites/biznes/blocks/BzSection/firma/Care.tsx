import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { SectionData } from '@/lib/biznes/pages/sections'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import { getSiteSettings } from '@/lib/site/data'
import { toTelHref } from '@/lib/site/link'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'

import { Breadcrumbs, type Crumb } from '../../../components/Breadcrumbs'
import { AddActionButton } from '../AddActionButton'
import { productsBySlug } from '../common/Products'
import { BTN_OUTLINE, BTN_PRIMARY, CARD, EYEBROW, SectionShell, withTrail } from '../ui'

const TONE: Record<SectionData<'care-hero'>['report']['rows'][number]['tone'], string> = {
  ok: 'bg-ok/15 text-ok-text',
  warn: 'bg-promo/25 text-ink',
  urgent: 'bg-[color-mix(in_srgb,var(--c-biznes-tone-red)_18%,transparent)] text-ink',
  due: 'bg-accent-text/12 text-accent-text',
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
      className="scroll-mt-28 bg-surface-2 pt-6 pb-14 sm:pt-8 sm:pb-20"
    >
      <Container wide>
        <div className="mb-7">
          <Breadcrumbs items={withTrail(crumbs, data.trail)} />
        </div>
        <div className="grid items-center gap-10 min-[1080px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6 text-ink">
            <p
              className={cx(
                EYEBROW,
                'inline-flex items-center gap-2 self-start rounded-full bg-card px-3.5 py-2 text-accent-text shadow-[inset_0_0_0_1px_var(--border)]',
              )}
            >
              <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
              {data.pill}
            </p>
            <h1
              id="opieka-h"
              className="font-display text-[clamp(2.2rem,4.2vw,3.8rem)] leading-[1] font-extrabold tracking-[-0.025em] font-stretch-110% text-balance"
            >
              {block.heading || crumbs.at(-1)?.name}{' '}
              {block.headingAccent && (
                <em className="text-accent-text not-italic">{block.headingAccent}</em>
              )}
            </h1>
            {block.lead && (
              <p className="max-w-[58ch] text-[clamp(1.0625rem,1.3vw,1.2rem)] leading-relaxed text-pretty text-ink-2">
                {block.lead}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <AddActionButton
                slug={data.review.slug}
                label={data.review.label}
                note={data.review.note}
                className={BTN_PRIMARY}
              />
              {phone && tel && (
                <a href={tel} className={BTN_OUTLINE}>
                  {phone}
                </a>
              )}
            </div>
            <dl className="grid grid-cols-3 gap-4 border-t border-border pt-5">
              {data.stats.map((stat) => (
                <div key={stat.k} className="flex flex-col-reverse gap-1">
                  <dt className="text-[14px] leading-snug text-ink-2">{stat.k}</dt>
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
      <ul className="grid gap-4 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-4">
        {data.items.map((item) => {
          const [product] = item.image ? productsBySlug(index, [item.image]) : []
          return (
            <li key={item.t} className={cx(CARD, 'flex flex-col gap-2 p-5 text-ink')}>
              {product?.image && (
                <span className="mb-2 flex h-28 items-center justify-center rounded-2xl bg-surface-2 p-3">
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
        <div className={cx(CARD, 'flex flex-col gap-4 p-6 text-ink sm:p-7')}>
          <p className={cx(EYEBROW, 'text-accent-text')}>{data.start.eyebrow}</p>
          <h3 className="font-display text-[1.5rem] leading-tight font-extrabold">
            {data.start.heading}
          </h3>
          <ol className="flex flex-col gap-3">
            {data.start.items.map((item, i) => (
              <li key={item.t} className="flex gap-3">
                <i className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-2 font-display font-extrabold text-accent-text not-italic">
                  {i + 1}
                </i>
                <span className="flex flex-col">
                  <b className="font-extrabold">{item.t}</b>
                  <small className="text-[14px] leading-relaxed text-ink-2">{item.d}</small>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className={cx(CARD, 'flex flex-col gap-4 p-6 text-ink sm:p-7')}>
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
