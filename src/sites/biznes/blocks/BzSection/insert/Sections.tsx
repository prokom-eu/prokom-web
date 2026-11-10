import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { SectionData } from '@/lib/biznes/pages/sections'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import { productHref } from '@/lib/catalog/card'
import { daysUntil } from '@/lib/site/days'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'
import { BZ_H1, BZ_LEAD } from '@/sites/biznes/typography'

import { Breadcrumbs, type Crumb } from '../../../components/Breadcrumbs'
import { DayCount } from '../../BzKsef/DayCount'
import { AddActionButton } from '../AddActionButton'
import { InsertOrbit, type OrbitBox } from './Orbit'
import { productsBySlug } from '../common/Products'
import {
  BTN,
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
  // Web-insert composition (PREMIUM-1011): nexo in the middle, the programs around it.
  const imageOf = (slug: string) => productsBySlug(index, [slug])[0]?.image
  const orbit = data.orbit
  const centerImage = orbit ? imageOf(orbit.center) : undefined
  const center: OrbitBox | null =
    orbit && centerImage
      ? {
          slug: orbit.center,
          name: boxes.find((box) => box.slug === orbit.center)?.name ?? 'Subiekt nexo',
          image: centerImage,
        }
      : null
  const satellites: OrbitBox[] = (orbit?.items ?? []).flatMap((item) => {
    const image = imageOf(item.slug)
    return image
      ? [{ slug: item.slug, name: item.n, line: item.d, image, x: item.x, y: item.y }]
      : []
  })
  return (
    <section
      aria-labelledby="insert-h"
      data-surface="dark"
      // Phone (App-InsERT): a card with a margin, the programs as small text tiles.
      className="relative isolate overflow-hidden bg-surface-dark pt-6 pb-12 text-white max-md:mx-4 max-md:mt-3 max-md:rounded-[26px] max-md:pt-5 max-md:pb-5 min-[768px]:pt-8 min-[768px]:pb-16"
    >
      <Container wide>
        <div className="mb-7 max-md:hidden">
          <Breadcrumbs items={withTrail(crumbs, data.trail)} onDark />
        </div>
        <div className="grid items-center gap-10 max-md:gap-4 min-[1080px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6 max-md:gap-3.5">
            <div className="flex flex-wrap items-center gap-3 max-md:gap-2">
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
                  'inline-flex rounded-full bg-white/10 px-3.5 py-2 text-white ring-1 ring-white/20 ring-inset max-md:px-3 max-md:py-1.5 max-md:text-[11px] max-md:tracking-normal max-md:normal-case',
                )}
              >
                {data.pill}
              </span>
            </div>
            <h1 id="insert-h" className={cx(BZ_H1, 'max-md:text-[30px] max-md:leading-[1.05]')}>
              {block.heading || crumbs.at(-1)?.name}{' '}
              {block.headingAccent && (
                <span className="text-accent-on-dark">{block.headingAccent}</span>
              )}
            </h1>
            {block.lead && (
              <p
                className={`${BZ_LEAD} max-w-[56ch] text-pretty text-white/85 max-md:text-[14.5px] max-md:leading-relaxed`}
              >
                {block.lead}
              </p>
            )}
            <div className="flex flex-wrap gap-3 max-md:grid max-md:grid-cols-2 max-md:gap-2">
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
          {center ? (
            <InsertOrbit center={center} items={satellites} badges={data.badges} />
          ) : (
            <div className="flex flex-col gap-5 max-md:gap-3">
              <ul className="grid grid-cols-3 gap-3 max-md:gap-1.5 min-[640px]:grid-cols-4">
                {boxes.map((box) => (
                  <li key={box.slug}>
                    <Link
                      href={productHref(box.slug)}
                      title={box.name}
                      className="flex aspect-[3/4] flex-col items-center justify-end gap-2 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 transition-colors hover:bg-white/10 max-md:aspect-auto max-md:min-h-12 max-md:justify-center max-md:rounded-xl max-md:p-2"
                    >
                      <Image
                        unoptimized
                        src={box.image.url}
                        alt={box.name}
                        width={box.image.width}
                        height={box.image.height}
                        className="max-h-[75%] w-auto object-contain max-md:hidden"
                      />
                      <span className="text-center text-[13px] font-extrabold max-md:text-xs max-md:leading-tight">
                        {box.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Phone: the partner status is in the pill above. */}
              <ul className="flex flex-wrap gap-2 max-md:hidden">
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
          )}
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

/** Glass on navy (Web-insert KSeF): a faint white fill with a light ring. */
const GLASS = 'rounded-[18px] bg-white/[0.06] ring-1 ring-white/12'

/**
 * KSeF in InsERT (#ksef): days to the end of the transition, the timeline, six steps. On navy
 * (Web-insert, PREMIUM-1011) the dates are glass cards one under another and the steps glass
 * tiles; on a light section the earlier cards stay.
 */
export function InsertKsef({
  block,
  data,
}: {
  block: BzSectionData
  data: SectionData<'insert-ksef'>
}) {
  const dark = block.surface === 'dark'
  const counting = daysUntil(data.date, new Date()) !== null
  return (
    <SectionShell
      block={block}
      aside={
        counting ? (
          <p
            className={cx(
              'flex items-baseline gap-2 rounded-2xl px-5 py-3',
              dark ? 'bg-white/10 ring-1 ring-white/15' : 'bg-surface-dark text-white',
            )}
          >
            <DayCount
              date={data.date}
              className="font-display text-4xl font-extrabold tabular-nums"
            />
            <span className="text-[14px] text-white/80">dni do {dateLabel(data.date)}</span>
          </p>
        ) : null
      }
    >
      {dark ? (
        <ol className={cx(GLASS, 'flex flex-col gap-2 p-2.5 sm:p-4')} data-ksef-timeline>
          {data.timeline.map((item) => (
            <li
              key={item.d}
              className={cx(GLASS, 'flex flex-col gap-1 px-5 py-4 max-md:px-4 max-md:py-3')}
            >
              <em className="font-display text-lg font-extrabold text-accent-on-dark not-italic max-md:text-[15px]">
                {item.d}
              </em>
              <b className="font-display text-xl font-extrabold max-md:text-base">{item.t}</b>
              <span className="text-[14px] leading-relaxed text-white/75 max-md:text-[13px]">
                {item.s}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        /* Phone (App-InsERT): the dates as compact rows. */
        <ol className="grid gap-4 max-md:gap-0 max-md:divide-y max-md:divide-border max-md:rounded-[20px] max-md:px-4 max-md:shadow-[inset_0_0_0_1px_var(--border)] min-[900px]:grid-cols-3">
          {data.timeline.map((item) => (
            <li
              key={item.d}
              className={cx(
                CARD,
                'flex flex-col gap-1.5 p-5 text-ink max-md:grid max-md:grid-cols-[88px_minmax(0,1fr)] max-md:gap-x-3 max-md:gap-y-0.5 max-md:rounded-none max-md:bg-transparent max-md:px-0 max-md:py-3 max-md:shadow-none',
              )}
            >
              <em className="text-[13px] font-extrabold text-accent-text not-italic max-md:row-span-2 max-md:text-xs">
                {item.d}
              </em>
              <b className="font-display text-lg font-extrabold max-md:text-[15px]">{item.t}</b>
              <span className="text-[15px] leading-relaxed text-ink-2 max-md:text-[13px] max-md:leading-snug">
                {item.s}
              </span>
            </li>
          ))}
        </ol>
      )}
      <ol className="mt-5 grid gap-3 max-md:mt-4 max-md:gap-1.5 min-[640px]:grid-cols-2 min-[1080px]:grid-cols-3">
        {data.checklist.map((item, i) => (
          <li
            key={item.t}
            className={cx(
              'flex gap-3 p-4 max-md:items-center max-md:p-3',
              dark ? GLASS : 'rounded-2xl bg-surface-2',
            )}
          >
            <i
              className={cx(
                'flex size-8 shrink-0 items-center justify-center rounded-full font-display font-extrabold not-italic',
                dark ? 'bg-white/12 text-white' : 'bg-accent-text text-accent-ink',
              )}
            >
              {i + 1}
            </i>
            <span className="flex flex-col">
              <b className={cx('font-extrabold', dark ? 'text-white' : 'text-ink')}>{item.t}</b>
              <small className={cx('text-[14px]', dark ? 'text-white/70' : 'text-ink-2')}>
                {item.d}
              </small>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap gap-3 max-md:grid max-md:grid-cols-1">
        <AddActionButton
          slug={data.ksefSlug}
          label="Zapytaj o wdrożenie KSeF"
          note="KSeF — wdrożenie"
          className={dark ? cx(BTN, 'bg-white text-surface-dark hover:bg-white/90') : BTN_PRIMARY}
        />
        <a href="#inspunkty" className={dark ? BTN_ON_DARK : BTN_OUTLINE}>
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
