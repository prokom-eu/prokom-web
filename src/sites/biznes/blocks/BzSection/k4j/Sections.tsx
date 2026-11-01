import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { isAfterSwitch } from '@/lib/biznes/pages/ksef'
import type { SectionData } from '@/lib/biznes/pages/sections'
import type { CatalogIndex } from '@/lib/catalog/catalogIndex'
import { productHref } from '@/lib/catalog/card'
import { getSiteSettings } from '@/lib/site/data'
import { daysUntil } from '@/lib/site/days'
import { toTelHref } from '@/lib/site/link'
import type { BzSectionBlock as BzSectionData } from '@/payload-types'

import { Breadcrumbs, type Crumb } from '../../../components/Breadcrumbs'
import { DayCount } from '../../BzKsef/DayCount'
import { AddActionButton } from '../AddActionButton'
import { ProductGrid, productsBySlug } from '../common/Products'
import {
  BTN_ON_DARK,
  BTN_OUTLINE,
  BTN_PRIMARY,
  CARD,
  EYEBROW,
  H2,
  SectionShell,
  withTrail,
} from '../ui'
import { AddMachineButton, ClientTabs, KsefTimeline, PhaseText } from './Client'

const HERO_H1 =
  'font-display text-[clamp(2.2rem,4.2vw,3.8rem)] leading-[1] font-extrabold tracking-[-0.025em] font-stretch-110% text-balance'

const plainSpaces = (text: string) => text.replace(/\s+/g, ' ').trim()

async function officePhone(tenantId: number) {
  const settings = await getSiteSettings(tenantId)
  const phone = settings?.phone ?? null
  return { phone, tel: phone ? toTelHref(phone) : null }
}

/**
 * Automaty vendingowe hero (K32 §2, plansza Web-Vending): Optivendi logo and „Partner Optivendi”,
 * H1, lead, proofs, three machines from the catalog (the board's photos are not in the package).
 */
export function VendingHero({
  block,
  data,
  index,
  crumbs,
}: {
  block: BzSectionData
  data: SectionData<'vending-hero'>
  index: CatalogIndex
  crumbs: readonly Crumb[]
}) {
  const logo = data.logoBrand
    ? index.brands.find((b) => b.slug === data.logoBrand)?.logo
    : undefined
  const machines = productsBySlug(index, data.collage).filter((p) => p.image)
  return (
    <section aria-labelledby="vending-h" className="bg-surface-2 pt-6 pb-14 sm:pt-8 sm:pb-20">
      <Container wide>
        <div className="mb-7">
          <Breadcrumbs items={withTrail(crumbs, data.trail)} />
        </div>
        <div className="grid items-center gap-10 min-[1080px]:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6 text-ink">
            <div className="flex flex-wrap items-center gap-3">
              {logo && (
                <span className="inline-flex h-11 items-center rounded-xl bg-card px-3 shadow-[inset_0_0_0_1px_var(--border)]">
                  <Image
                    unoptimized
                    src={logo.url}
                    alt="Optivendi"
                    width={logo.width}
                    height={logo.height}
                    className="h-auto max-h-7 w-auto max-w-[120px] object-contain"
                  />
                </span>
              )}
              <span
                className={cx(
                  EYEBROW,
                  'inline-flex items-center gap-2 rounded-full bg-card px-3.5 py-2 text-accent-text shadow-[inset_0_0_0_1px_var(--border)]',
                )}
              >
                <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
                {data.pill}
              </span>
            </div>
            <h1 id="vending-h" className={HERO_H1}>
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
              {data.actions.map((action, i) => (
                <a
                  key={action.href}
                  href={action.href}
                  className={i === 0 ? BTN_PRIMARY : BTN_OUTLINE}
                >
                  {action.label}
                </a>
              ))}
            </div>
            <ul className="grid gap-x-6 gap-y-3 min-[640px]:grid-cols-2">
              {data.proof.map((proof) => (
                <li key={proof.t} className="flex gap-3">
                  <span aria-hidden="true" className="mt-0.5 text-ok-text">
                    ✓
                  </span>
                  <span className="flex flex-col">
                    <b className="font-extrabold">{proof.t}</b>
                    <small className="text-[14px] text-ink-2">{proof.d}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {machines.length > 0 && (
            <div aria-hidden="true" className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                {machines.map((machine) => (
                  <span
                    key={machine.slug}
                    className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-white p-3 shadow-[0_24px_48px_-32px_var(--glow)]"
                  >
                    <Image
                      unoptimized
                      src={machine.image!.url}
                      alt=""
                      width={machine.image!.width}
                      height={machine.image!.height}
                      className="max-h-full w-auto object-contain"
                    />
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {data.badges.map((badge) => (
                  <em
                    key={badge}
                    className="rounded-full bg-card px-3 py-1.5 text-[13px] font-extrabold text-ink not-italic shadow-[inset_0_0_0_1px_var(--border)]"
                  >
                    {badge}
                  </em>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

/** „Co chcesz sprzedawać?” (#co): a tab per product kind, its machines as rows to add. */
export function VendingPicker({
  block,
  data,
  index,
}: {
  block: BzSectionData
  data: SectionData<'vending-picker'>
  index: CatalogIndex
}) {
  const tabs = data.tabs
    .map((tab) => ({ ...tab, products: productsBySlug(index, tab.slugs) }))
    .filter((tab) => tab.products.length > 0)
  if (tabs.length === 0) return null
  return (
    <SectionShell block={block}>
      <ClientTabs
        label="Rodzaj produktu"
        tabs={tabs.map((tab) => ({ t: tab.t, n: tab.products.length }))}
        panels={tabs.map((tab) => (
          <div
            key={tab.t}
            className="grid gap-5 min-[1080px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"
          >
            <p className={cx(CARD, 'p-6 leading-relaxed text-ink-2')}>{tab.d}</p>
            <ul className="flex flex-col gap-3">
              {tab.products.map((product) => (
                <li key={product.slug} className={cx(CARD, 'flex items-center gap-4 p-3 text-ink')}>
                  <span className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-white p-2">
                    {product.image && (
                      <Image
                        unoptimized
                        src={product.image.url}
                        alt=""
                        width={product.image.width}
                        height={product.image.height}
                        className="max-h-full w-auto object-contain"
                      />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <Link
                      href={productHref(product.slug)}
                      className="font-extrabold hover:underline"
                    >
                      {product.name}
                    </Link>
                    {product.benefit && (
                      <small className="text-[14px] text-ink-2">{product.benefit}</small>
                    )}
                  </span>
                  <AddMachineButton slug={product.slug} name={product.name} note={data.note} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      />
    </SectionShell>
  )
}

/** „Automat w Twoim telefonie”: software features and a static phone screen (no discounts). */
export function AppMockup({
  block,
  data,
}: {
  block: BzSectionData
  data: SectionData<'app-mockup'>
}) {
  return (
    <SectionShell block={block}>
      <div className="grid items-center gap-8 min-[1080px]:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <ul className="grid gap-3 min-[640px]:grid-cols-2">
          {data.features.map((feature) => (
            <li key={feature.t} className={cx(CARD, 'flex flex-col gap-1 p-5 text-ink')}>
              <b className="font-extrabold">{feature.t}</b>
              <small className="text-[14px] leading-relaxed text-ink-2">{feature.d}</small>
            </li>
          ))}
        </ul>
        <div
          aria-hidden="true"
          className="mx-auto w-full max-w-[300px] rounded-[36px] bg-surface-dark p-3 shadow-[0_40px_80px_-40px_black]"
        >
          <div className="flex flex-col gap-3 rounded-[28px] bg-card p-4 text-ink">
            <div className="flex items-center justify-between">
              <b className="text-[14px] font-extrabold">{data.screen.title}</b>
              <span className="rounded-full bg-ok/15 px-2 py-0.5 text-[12px] font-extrabold text-ok-text">
                {data.screen.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data.screen.figures.map((figure) => (
                <div key={figure.k} className="rounded-xl bg-surface-2 p-3">
                  <small className="text-[12px] text-ink-3">{figure.k}</small>
                  <b className="block font-display text-lg font-extrabold">{figure.v}</b>
                </div>
              ))}
            </div>
            {data.screen.rows.map((row) => (
              <div key={row.t} className="rounded-xl bg-surface-2 p-3">
                <b className="block text-[14px] font-extrabold">{row.t}</b>
                <small className="text-[13px] text-ink-2">{row.d}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  )
}

/** Catalog cards of one category, a tab per subcategory; the counts come from the database. */
export function CatalogTabs({
  block,
  data,
  index,
}: {
  block: BzSectionData
  data: SectionData<'catalog-tabs'>
  index: CatalogIndex
}) {
  const inCategory = index.products.filter((product) => product.categories[0] === data.category)
  const tabs = data.tabs
    .map((tab) => ({
      ...tab,
      // Names compared with plain spaces: the seed's hard spaces must not hide the match.
      products: inCategory.filter(
        (p) => plainSpaces(p.subcategory ?? '') === plainSpaces(tab.subcategory),
      ),
    }))
    .filter((tab) => tab.products.length > 0)
  if (tabs.length === 0) return null
  return (
    <SectionShell
      block={block}
      aside={
        data.note ? (
          <span className="rounded-full bg-surface-2 px-3.5 py-2 text-[14px] font-extrabold text-ink-2">
            {data.note}
          </span>
        ) : null
      }
    >
      <ClientTabs
        label="Grupy"
        tabs={tabs.map((tab) => ({ t: tab.t, n: tab.products.length }))}
        panels={tabs.map((tab) => (
          <ProductGrid key={tab.t} index={index} products={tab.products} />
        ))}
      />
    </SectionShell>
  )
}

/** Sources of the page's facts — each a link — and the „stan na” note. */
export function SourcesSection({
  block,
  data,
}: {
  block: BzSectionData
  data: SectionData<'sources'>
}) {
  return (
    <SectionShell block={block} className="py-8 sm:py-10">
      <div className={cx(CARD, 'flex flex-col gap-3 p-5 text-ink')}>
        <p className="font-extrabold">Źródła</p>
        <ul className="flex flex-col gap-2">
          {data.items.map((item) => (
            <li key={item.url}>
              <a
                href={item.url}
                rel="noopener"
                target="_blank"
                className="inline-flex min-h-11 items-center text-[15px] font-bold text-accent-text hover:underline"
              >
                {item.t}
                <span className="sr-only"> (otwiera się w nowej karcie)</span>
              </a>
            </li>
          ))}
        </ul>
        {data.note && <p className="text-[13px] text-ink-3">{data.note}</p>}
      </div>
    </SectionShell>
  )
}

/**
 * KSeF hero (K35 §2, K36 §3, D-K4-7): the H1 and lead in two versions switched on the day in
 * Poland (or `?ksefpo=1`), the day counter, the timeline of dates with their status.
 */
export async function KsefHero({
  data,
  crumbs,
  tenantId,
}: {
  data: SectionData<'ksef-hero'>
  crumbs: readonly Crumb[]
  tenantId: number
}) {
  const now = new Date()
  const serverAfter = isAfterSwitch(data.switchDate, now)
  const counting = daysUntil(data.switchDate, now) !== null
  const { phone, tel } = await officePhone(tenantId)
  const version = (v: SectionData<'ksef-hero'>['before']) => (
    <>
      <h1 id="ksef-h" className={HERO_H1}>
        {v.h1a} <em className="text-accent-on-dark not-italic">{v.h1b}</em>
      </h1>
      <p className="max-w-[60ch] text-[clamp(1.0625rem,1.3vw,1.2rem)] leading-relaxed text-pretty text-white/85">
        {v.lead}
      </p>
    </>
  )
  return (
    <section
      aria-labelledby="ksef-h"
      data-surface="dark"
      className="bg-surface-dark pt-6 pb-14 text-white sm:pt-8 sm:pb-20"
    >
      <Container wide>
        <div className="mb-7">
          <Breadcrumbs items={withTrail(crumbs, data.trail)} onDark />
        </div>
        <div className="grid items-start gap-10 min-[1080px]:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="flex flex-col gap-6">
            <p
              className={cx(
                EYEBROW,
                'inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3.5 py-2 text-accent-on-dark ring-1 ring-white/20',
              )}
            >
              {data.pill}
            </p>
            <PhaseText
              date={data.switchDate}
              serverAfter={serverAfter}
              before={version(data.before)}
              after={version(data.after)}
            />
            <div className="flex flex-wrap gap-3">
              <AddActionButton
                slug={data.ask.slug}
                label={data.ask.label}
                note={data.ask.note}
                className={BTN_PRIMARY}
              />
              {phone && tel && (
                <a href={tel} className={BTN_ON_DARK}>
                  {phone}
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-[28px] bg-white/5 p-5 ring-1 ring-white/10 sm:p-6">
            <PhaseText
              date={data.switchDate}
              serverAfter={serverAfter}
              before={
                counting ? (
                  <p className="flex items-baseline gap-3">
                    <DayCount
                      date={data.switchDate}
                      className="font-display text-[clamp(3.4rem,6vw,4.6rem)] leading-none font-extrabold tabular-nums"
                    />
                    <span className="text-lg font-bold">dni do KSeF bez wyjątków</span>
                  </p>
                ) : null
              }
              after={
                <p className="flex items-center gap-3 text-lg font-extrabold">
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-full bg-ok text-surface-dark"
                  >
                    ✓
                  </span>
                  KSeF · obowiązuje od 1 stycznia 2027
                </p>
              }
            />
            <KsefTimeline
              points={data.timeline}
              switchDate={data.switchDate}
              serverAfter={serverAfter}
            />
          </div>
        </div>
      </Container>
    </section>
  )
}

/** Penalties (both versions) and „Jak pomagamy” with three products. */
export function KsefPenalties({
  block,
  data,
  index,
}: {
  block: BzSectionData
  data: SectionData<'ksef-penalties'>
  index: CatalogIndex
}) {
  const serverAfter = isAfterSwitch(data.switchDate, new Date())
  const products = productsBySlug(index, data.help.products)
  return (
    <SectionShell block={block} head={false}>
      <div className="grid gap-5 min-[1080px]:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-[24px] bg-surface-dark p-6 text-white sm:p-8">
          <p className={cx(EYEBROW, 'text-accent-on-dark')}>{data.penalties.eyebrow}</p>
          <h2 className={cx(H2, 'text-white')}>{data.penalties.heading}</h2>
          <dl className="grid grid-cols-2 gap-3">
            {data.penalties.figures.map((figure) => (
              <div
                key={figure.v}
                className="flex flex-col-reverse gap-1 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10"
              >
                <dt className="text-[14px] text-white/80">{figure.k}</dt>
                <dd className="font-display text-[2rem] leading-none font-extrabold">{figure.v}</dd>
              </div>
            ))}
          </dl>
          <p className="leading-relaxed text-white/85">
            {data.penalties.text}{' '}
            <PhaseText
              date={data.switchDate}
              serverAfter={serverAfter}
              before={data.penalties.before}
              after={data.penalties.after}
            />
          </p>
        </div>
        <div className={cx(CARD, 'flex flex-col gap-4 p-6 text-ink sm:p-8')}>
          <p className={cx(EYEBROW, 'text-accent-text')}>{data.help.eyebrow}</p>
          <h2 className={H2}>{data.help.heading}</h2>
          <ul className="flex flex-col gap-3">
            {data.help.items.map((item) => (
              <li key={item.t} className="flex gap-3">
                <span aria-hidden="true" className="text-ok-text">
                  ✓
                </span>
                <span className="flex flex-col">
                  <b className="font-extrabold">{item.t}</b>
                  <small className="text-[14px] leading-relaxed text-ink-2">{item.d}</small>
                </span>
              </li>
            ))}
          </ul>
          {products.length > 0 && (
            <ul className="grid grid-cols-3 gap-3">
              {products.map((product) => (
                <li key={product.slug}>
                  <Link
                    href={productHref(product.slug)}
                    className="flex h-full flex-col items-center gap-2 rounded-2xl bg-surface-2 p-3 text-center hover:shadow-[inset_0_0_0_1px_var(--ink-3)]"
                  >
                    {product.image && (
                      <Image
                        unoptimized
                        src={product.image.url}
                        alt=""
                        width={product.image.width}
                        height={product.image.height}
                        className="h-16 w-auto object-contain"
                      />
                    )}
                    <b className="text-[13.5px] leading-snug font-extrabold">{product.name}</b>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={data.help.link.href}
            className="font-extrabold text-accent-text hover:underline"
          >
            {data.help.link.label} →
          </Link>
        </div>
      </div>
    </SectionShell>
  )
}

/** Ulga hero (K35 §3): H1, lead with „rozlicza księgowa”, four cards. */
export async function UlgaHero({
  block,
  data,
  crumbs,
  tenantId,
}: {
  block: BzSectionData
  data: SectionData<'ulga-hero'>
  crumbs: readonly Crumb[]
  tenantId: number
}) {
  const { phone, tel } = await officePhone(tenantId)
  return (
    <section aria-labelledby="ulga-h" className="bg-surface-2 pt-6 pb-14 sm:pt-8 sm:pb-20">
      <Container wide>
        <div className="mb-7">
          <Breadcrumbs items={withTrail(crumbs, data.trail)} />
        </div>
        <div className="grid items-center gap-10 min-[1080px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6 text-ink">
            <p
              className={cx(
                EYEBROW,
                'inline-flex items-center gap-2 self-start rounded-full bg-card px-3.5 py-2 text-accent-text shadow-[inset_0_0_0_1px_var(--border)]',
              )}
            >
              {data.pill}
            </p>
            <h1 id="ulga-h" className={HERO_H1}>
              {block.heading || crumbs.at(-1)?.name}{' '}
              {block.headingAccent && (
                <em className="text-accent-text not-italic">{block.headingAccent}</em>
              )}
            </h1>
            {block.lead && (
              <p className="max-w-[60ch] text-[clamp(1.0625rem,1.3vw,1.2rem)] leading-relaxed text-pretty text-ink-2">
                {block.lead}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              {data.actions.map((action, i) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className={i === 0 ? BTN_PRIMARY : BTN_OUTLINE}
                >
                  {action.label}
                </Link>
              ))}
              {phone && tel && (
                <a href={tel} className={BTN_OUTLINE}>
                  {phone}
                </a>
              )}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3">
            {data.cards.map((card) => (
              <div key={card.k} className={cx(CARD, 'flex flex-col gap-1 p-5 text-ink')}>
                <dt className="text-[13px] font-extrabold text-ink-3">{card.k}</dt>
                <dd className="font-display text-[clamp(1.5rem,2.6vw,2.2rem)] leading-tight font-extrabold">
                  {card.v}
                </dd>
                <dd className="text-[14px] leading-snug text-ink-2">{card.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}

/** „Ulga przysługuje” / „Ulga nie przysługuje”. */
export function YesNo({ block, data }: { block: BzSectionData; data: SectionData<'yes-no'> }) {
  const column = (title: string, items: string[], ok: boolean) => (
    <div className={cx(CARD, 'flex flex-col gap-3 p-6 text-ink')}>
      <b className="font-display text-lg font-extrabold">{title}</b>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-2.5 leading-relaxed text-ink-2">
            <span aria-hidden="true" className={ok ? 'text-ok-text' : 'text-ink-3'}>
              {ok ? '✓' : '✕'}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
  return (
    <SectionShell block={block}>
      <div className="grid gap-4 min-[900px]:grid-cols-2">
        {column(data.yes.t, data.yes.items, true)}
        {column(data.no.t, data.no.items, false)}
      </div>
    </SectionShell>
  )
}

/** A list with a side card („Kiedy trzeba oddać ulgę?”). */
export function Notice({ block, data }: { block: BzSectionData; data: SectionData<'notice'> }) {
  return (
    <SectionShell block={block}>
      <div className="grid gap-4 min-[900px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <ul className={cx(CARD, 'flex flex-col gap-3 p-6 text-ink')}>
          {data.items.map((item) => (
            <li key={item} className="flex gap-2.5 leading-relaxed text-ink-2">
              <span aria-hidden="true" className="text-promo-ink">
                !
              </span>
              {item}
            </li>
          ))}
        </ul>
        {data.aside && (
          <div className="flex flex-col gap-2 rounded-[22px] bg-surface-dark p-6 text-white">
            <b className="font-display text-lg font-extrabold">{data.aside.t}</b>
            <p className="leading-relaxed text-white/85">{data.aside.d}</p>
          </div>
        )}
      </div>
    </SectionShell>
  )
}
