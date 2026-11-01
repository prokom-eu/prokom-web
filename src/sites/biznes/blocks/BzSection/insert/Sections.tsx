import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { SectionData } from '@/lib/biznes/pages/sections'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import { productHref } from '@/lib/catalog/card'
import { daysUntil } from '@/lib/site/days'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'

import { Breadcrumbs, type Crumb } from '../../../components/Breadcrumbs'
import { DayCount } from '../../BzKsef/DayCount'
import { AddActionButton } from '../AddActionButton'
import { productsBySlug } from '../common/Products'
import {
  BTN_ON_DARK,
  BTN_OUTLINE,
  BTN_PRIMARY,
  CARD,
  EYEBROW,
  SectionShell,
  withTrail,
} from '../ui'

/**
 * InsERT hero (K33 §7, plansza Web-InsERT): partner pill, H1 with the accented part, lead, two
 * anchors; on the right the shelf of program boxes (a click opens the card) and three badges.
 */
export function InsertHero({
  block,
  data,
  index,
  crumbs,
}: {
  block: BzSectionData
  data: SectionData<'insert-hero'>
  index: CatalogIndex
  crumbs: readonly Crumb[]
}) {
  const logo = index.brands.find((brand) => brand.slug === 'insert')?.logo
  const boxes = data.boxes.flatMap((box) => {
    const [product] = productsBySlug(index, [box.slug])
    return product?.image ? [{ ...box, image: product.image }] : []
  })
  return (
    <section
      aria-labelledby="insert-h"
      data-surface="dark"
      className="relative isolate overflow-hidden bg-surface-dark pt-6 pb-12 text-white sm:pt-8 sm:pb-16"
    >
      <Container wide>
        <div className="mb-7">
          <Breadcrumbs items={withTrail(crumbs, data.trail)} onDark />
        </div>
        <div className="grid items-center gap-10 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              {logo && (
                <span className="inline-flex h-11 items-center rounded-xl bg-white px-3">
                  <Image
                    unoptimized
                    src={logo.url}
                    alt="InsERT"
                    width={logo.width}
                    height={logo.height}
                    className="h-auto max-h-7 w-auto max-w-[120px] object-contain"
                  />
                </span>
              )}
              <span
                className={cx(
                  EYEBROW,
                  'inline-flex rounded-full bg-white/10 px-3.5 py-2 text-white ring-1 ring-white/20 ring-inset',
                )}
              >
                {data.pill}
              </span>
            </div>
            <h1
              id="insert-h"
              className="font-display text-[clamp(2.3rem,4.4vw,4rem)] leading-[0.98] font-extrabold tracking-[-0.025em] font-stretch-112% text-balance"
            >
              {block.heading || crumbs.at(-1)?.name}{' '}
              {block.headingAccent && (
                <span className="text-accent-on-dark">{block.headingAccent}</span>
              )}
            </h1>
            {block.lead && (
              <p className="max-w-[56ch] text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-relaxed text-pretty text-white/85">
                {block.lead}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {data.actions.map((action, i) => (
                <a
                  key={action.href}
                  href={action.href}
                  className={i === 0 ? BTN_PRIMARY : BTN_ON_DARK}
                >
                  {action.label}
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <ul className="grid grid-cols-3 gap-3 min-[640px]:grid-cols-4">
              {boxes.map((box) => (
                <li key={box.slug}>
                  <Link
                    href={productHref(box.slug)}
                    title={box.name}
                    className="flex aspect-[3/4] flex-col items-center justify-end gap-2 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 transition-colors hover:bg-white/10"
                  >
                    <Image
                      unoptimized
                      src={box.image.url}
                      alt={box.name}
                      width={box.image.width}
                      height={box.image.height}
                      className="max-h-[75%] w-auto object-contain"
                    />
                    <span className="text-center text-[13px] font-extrabold">{box.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="flex flex-wrap gap-2">
              {data.badges.map((badge) => (
                <li
                  key={badge}
                  className="rounded-full bg-white/10 px-3.5 py-2 text-[14px] font-extrabold ring-1 ring-white/15"
                >
                  {badge}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}

/** „1 stycznia 2027” from the ISO date of the panel (the day in Poland). */
const dateLabel = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Warsaw',
  })

/** KSeF in InsERT (#ksef): days to the end of the transition, the timeline, six steps. */
export function InsertKsef({
  block,
  data,
}: {
  block: BzSectionData
  data: SectionData<'insert-ksef'>
}) {
  const counting = daysUntil(data.date, new Date()) !== null
  return (
    <SectionShell
      block={block}
      aside={
        counting ? (
          <p className="flex items-baseline gap-2 rounded-2xl bg-surface-dark px-5 py-3 text-white">
            <DayCount
              date={data.date}
              className="font-display text-4xl font-extrabold tabular-nums"
            />
            <span className="text-[14px] text-white/80">dni do {dateLabel(data.date)}</span>
          </p>
        ) : null
      }
    >
      <ol className="grid gap-4 min-[900px]:grid-cols-3">
        {data.timeline.map((item) => (
          <li key={item.d} className={cx(CARD, 'flex flex-col gap-1.5 p-5 text-ink')}>
            <em className="text-[13px] font-extrabold text-accent-text not-italic">{item.d}</em>
            <b className="font-display text-lg font-extrabold">{item.t}</b>
            <span className="text-[15px] leading-relaxed text-ink-2">{item.s}</span>
          </li>
        ))}
      </ol>
      <ol className="mt-5 grid gap-3 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-3">
        {data.checklist.map((item, i) => (
          <li key={item.t} className="flex gap-3 rounded-2xl bg-surface-2 p-4">
            <i className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-text font-display font-extrabold text-accent-ink not-italic">
              {i + 1}
            </i>
            <span className="flex flex-col">
              <b className="font-extrabold text-ink">{item.t}</b>
              <small className="text-[14px] text-ink-2">{item.d}</small>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap gap-3">
        <AddActionButton
          slug={data.ksefSlug}
          label="Zapytaj o wdrożenie KSeF"
          note="KSeF — wdrożenie"
          className={BTN_PRIMARY}
        />
        <a href="#inspunkty" className={BTN_OUTLINE}>
          InsPunkty — opłaty za KSeF
        </a>
      </div>
    </SectionShell>
  )
}

/** Computer for Subiekt nexo: minimum and recommended, two matching computers. */
export function InsertRequirements({
  block,
  data,
  index,
}: {
  block: BzSectionData
  data: SectionData<'insert-requirements'>
  index: CatalogIndex
}) {
  const computers = productsBySlug(index, data.computers)
  const table = (title: string, rows: { k: string; v: string }[]) => (
    <div className={cx(CARD, 'flex flex-col gap-3 p-5 text-ink')}>
      <em className={cx(EYEBROW, 'text-accent-text not-italic')}>{title}</em>
      <dl className="flex flex-col gap-2.5">
        {rows.map((row) => (
          <div key={row.k} className="grid gap-1 min-[480px]:grid-cols-[120px_1fr]">
            <dt className="text-[14px] text-ink-2">{row.k}</dt>
            <dd className="font-bold">{row.v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
  return (
    <SectionShell block={block}>
      <div className="grid gap-5 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col gap-3">
          <p className="font-extrabold text-ink">
            Komputer pod Subiekta? Dobierzemy model zgodny z zaleceniami.
          </p>
          <ul className="grid grid-cols-2 gap-3">
            {computers.map((product) => (
              <li key={product.slug}>
                <Link
                  href={productHref(product.slug)}
                  className={cx(
                    CARD,
                    'flex h-full flex-col items-center gap-2 p-4 text-center text-ink hover:shadow-[inset_0_0_0_1px_var(--ink-3)]',
                  )}
                >
                  {product.image && (
                    <Image
                      unoptimized
                      src={product.image.url}
                      alt={product.name}
                      width={product.image.width}
                      height={product.image.height}
                      className="h-24 w-auto object-contain"
                    />
                  )}
                  <b className="text-[14px] leading-snug font-extrabold">{product.name}</b>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 min-[640px]:grid-cols-2">
          {table('Minimum', data.minimum)}
          {table('Zalecane przez InsERT', data.recommended)}
        </div>
      </div>
    </SectionShell>
  )
}
