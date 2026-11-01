import Image from 'next/image'
import Link from 'next/link'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { NoBreak } from '@/components/ui/NoBreak'
import { productHref } from '@/lib/catalog/card'
import type { IndexProduct } from '@/lib/catalog/catalogIndex'
import type { PlanCard, PlanSection, SalonView } from '@/lib/catalog/salon'
import { plural } from '@/lib/plural'

import { Breadcrumbs, type Crumb } from '../../Breadcrumbs'
import { ProductStage, STAGE_SHADOW } from '../../ProductStage'
import { CAROUSEL, CAROUSEL_ITEM } from './carousel'
import { Eyebrow, SalonAsk, SalonCompare } from './SalonClient'

/**
 * Sections of the salon 2.0 (K4-FINAL §6, board „SALON MARKI 2.0”). Server components; the
 * interactive parts (inquiry buttons, table, tabs, chooser) live in `SalonClient`.
 */

const ASK_BUTTON =
  'inline-flex min-h-11 items-center justify-center rounded-xl bg-accent-text px-5 font-extrabold text-accent-ink shadow-[0_14px_30px_-14px_var(--accent-text)] hover:bg-ink hover:text-surface'

const LIGHT_BUTTON =
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white px-6 font-extrabold text-surface-dark hover:bg-white/85'
const GLASS_BUTTON =
  'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white/8 px-6 font-extrabold text-white ring-1 ring-white/25 ring-inset hover:bg-white/14'

function Photo({
  product,
  className,
  eager = false,
}: {
  product: IndexProduct
  className?: string
  /** In the hero: above the fold, loaded at once (LCP). */
  eager?: boolean
}) {
  if (!product.image) return null
  return (
    <Image
      src={product.image.url}
      alt={product.name}
      width={product.image.width}
      height={product.image.height}
      unoptimized
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : undefined}
      className={cx('relative w-auto object-contain', STAGE_SHADOW, className)}
    />
  )
}

function SectionHead({
  eyebrow,
  title,
  lead,
  id,
  note = false,
}: {
  eyebrow: string
  title: string
  lead?: string | null
  id: string
  note?: boolean
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-3xl flex-col gap-3">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2
          id={id}
          className="font-display text-[clamp(1.4rem,3vw,2.4rem)] leading-tight font-extrabold text-balance text-ink"
        >
          <NoBreak text={title} />
        </h2>
        {lead && (
          <p className="text-ink-2 sm:text-lg">
            <NoBreak text={lead} />
          </p>
        )}
      </div>
      {note && (
        <span className="self-start rounded-full bg-surface-2 px-3 py-1.5 text-xs font-extrabold text-ink-2 sm:self-end">
          bez cen — oferta na piśmie
        </span>
      )}
    </div>
  )
}

export function SalonHero({ view, crumbs }: { view: SalonView; crumbs: Crumb[] }) {
  const offer = view.plans
    ? { href: '#oferta', label: 'Porównaj warianty', short: 'Warianty' }
    : {
        href: '#oferta-cala',
        label: `Zobacz ofertę · ${view.familyCount}`,
        short: `Oferta · ${view.familyCount}`,
      }
  // With the card the board shows two photos: the first product large on the right, the second
  // smaller on the left; without it up to three with their labels.
  const photos = view.heroCard ? view.hero.slice(0, 2).reverse() : view.hero
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <section
        aria-labelledby="salon-h1"
        data-surface="dark"
        className="relative mt-5 overflow-hidden rounded-[28px] bg-surface-dark px-5 py-8 text-white ring-1 ring-white/10 ring-inset sm:rounded-[36px] sm:px-12 sm:py-12 lg:px-14"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_70%_at_85%_15%,color-mix(in_srgb,var(--accent)_40%,transparent),transparent_70%),radial-gradient(40%_60%_at_10%_100%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_70%)]"
        />
        {/* Below 1080 px the left column dissolves (`contents`): photos and the card come right
            after the lead, then the facts and the buttons (board `App-Salon-*`). */}
        <div className="relative grid items-center gap-6 min-[1080px]:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] min-[1080px]:gap-10">
          <div className="contents min-[1080px]:flex min-[1080px]:flex-col min-[1080px]:gap-5">
            <div className="flex flex-wrap items-center gap-2.5 max-[1079px]:order-1">
              {view.brands.map((brand) => (
                <span
                  key={brand.id}
                  className="inline-flex h-12 items-center rounded-2xl bg-white px-4"
                >
                  {brand.logo ? (
                    <Image
                      src={brand.logo.url}
                      alt={brand.name}
                      width={brand.logo.width}
                      height={brand.logo.height}
                      unoptimized
                      loading="eager"
                      className="h-6 w-auto max-w-[140px] object-contain"
                    />
                  ) : (
                    <span className="font-display text-lg font-extrabold text-surface-dark">
                      {brand.name}
                    </span>
                  )}
                </span>
              ))}
              {view.pill && (
                <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/8 px-3.5 text-sm font-semibold ring-1 ring-white/15 ring-inset">
                  <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
                  <span className="max-sm:hidden">{view.pill}</span>
                  <span className="sm:hidden">{view.pillMobile ?? view.pill}</span>
                </span>
              )}
            </div>
            <h1
              id="salon-h1"
              className="font-display max-[1079px]:order-1 text-[clamp(2rem,3.3vw,3rem)] leading-[1.06] font-extrabold tracking-[-0.025em] text-balance"
            >
              <NoBreak text={view.h1a} />
              {view.h1b && (
                <>
                  {' '}
                  <em className="block text-accent-on-dark not-italic">
                    <NoBreak text={view.h1b} />
                  </em>
                </>
              )}
            </h1>
            {view.lead && (
              <p className="max-w-[58ch] text-[clamp(0.95rem,1.3vw,1.15rem)] leading-relaxed text-white/80 max-[1079px]:order-1">
                <NoBreak text={view.lead} />
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 max-[1079px]:order-4 min-[1080px]:flex min-[1080px]:flex-wrap">
              <a href={offer.href} className={cx(LIGHT_BUTTON, 'max-sm:px-3')}>
                <span className="max-sm:hidden">{offer.label}</span>
                <span className="sm:hidden">{offer.short}</span>
              </a>
              {view.chooser ? (
                <a href="#dobor" className={cx(GLASS_BUTTON, 'max-sm:px-3')}>
                  <span className="max-sm:hidden">Pomóż mi wybrać</span>
                  <span className="sm:hidden">Pomóż wybrać</span>
                </a>
              ) : (
                <a href="#sl-ask" className={cx(GLASS_BUTTON, 'max-sm:px-3')}>
                  Zapytaj o ofertę
                </a>
              )}
            </div>
            {view.facts.length > 0 && (
              <dl className="grid grid-cols-3 gap-3 border-t border-white/15 pt-5 max-[1079px]:order-3 sm:gap-4 min-[1080px]:mt-2 min-[1080px]:pt-6">
                {view.facts.map((fact) => (
                  // The label is the term, the value its description; the value shows on top.
                  <div key={fact.value} className="flex min-w-0 flex-col-reverse justify-end gap-1">
                    {fact.label && (
                      <dt className="text-xs text-white/70 sm:text-sm">{fact.label}</dt>
                    )}
                    <dd className="font-display text-base leading-tight font-extrabold break-words sm:text-xl">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="relative flex flex-col gap-4 max-[1079px]:order-2">
            {photos.length > 0 && (
              <div
                className={cx(
                  'grid items-end gap-3',
                  photos.length === 1
                    ? 'grid-cols-1'
                    : photos.length === 2
                      ? 'grid-cols-2'
                      : 'grid-cols-3',
                )}
              >
                {photos.map(({ product, label }, i) => (
                  <figure key={product.slug} className="flex flex-col items-center gap-2">
                    <Photo
                      product={product}
                      eager
                      className={cx(
                        'max-h-[220px] drop-shadow-[0_30px_40px_rgba(0,0,0,0.45)]',
                        photos.length > 1 && i === 0 && 'max-h-[150px]',
                      )}
                    />
                    {!view.heroCard && label && (
                      <figcaption className="text-xs font-semibold text-white/70">
                        {label}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
            {view.heroCard && (
              <div className="rounded-3xl bg-white/6 p-5 ring-1 ring-white/15 ring-inset backdrop-blur-md min-[1080px]:max-w-[300px]">
                {view.heroCard.title && (
                  <p className="pb-3 text-[11px] font-black tracking-[0.1em] text-accent-on-dark uppercase">
                    {view.heroCard.title}
                  </p>
                )}
                <ul className="flex flex-col gap-3">
                  {view.heroCard.items.map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-ok/20 text-ok">
                        <Icon name="check" strokeWidth={3} className="size-3.5" />
                      </span>
                      <span className="flex flex-col">
                        <b className="text-sm font-extrabold">{item.title}</b>
                        {item.text && <small className="text-xs text-white/70">{item.text}</small>}
                      </span>
                    </li>
                  ))}
                </ul>
                {view.heroCard.chips.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5 pt-4">
                    {view.heroCard.chips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

function PlanItem({
  card,
  brand,
  compact,
  big,
}: {
  card: PlanCard
  brand: string
  compact: boolean
  /** A section with large photos (`big`): the photo across the card, 210 px high (board). */
  big: boolean
}) {
  const ask = card.product ? [{ id: card.product.slug, note: `${brand} — ${card.name}` }] : []
  return (
    <article
      className={cx(
        'relative flex h-full flex-col gap-4 rounded-3xl bg-card p-5 shadow-[0_20px_50px_-34px_var(--glow),inset_0_0_0_1px_var(--border)]',
        card.tag &&
          'shadow-[0_20px_50px_-30px_var(--accent-text),inset_0_0_0_2px_var(--accent-text)]',
      )}
    >
      {card.tag && (
        <span className="absolute -top-3 right-5 rounded-full bg-accent-text px-3 py-1 text-xs font-extrabold text-accent-ink">
          {card.tag}
        </span>
      )}
      <div className={cx('flex gap-4', compact && !big ? 'items-center' : 'flex-col')}>
        {card.product?.image && (
          <ProductStage
            className={cx(
              'shrink-0 rounded-2xl',
              big
                ? 'h-[168px] w-full min-[761px]:h-[210px]'
                : compact
                  ? 'size-[76px]'
                  : 'h-[168px] w-full min-[761px]:h-[96px]',
            )}
          >
            <Photo product={card.product} className="max-h-[78%] max-w-[80%]" />
          </ProductStage>
        )}
        <div className="flex flex-col gap-1">
          {card.audience && (
            <p className="text-[11px] font-black tracking-[0.08em] text-accent-text uppercase">
              {card.audience}
            </p>
          )}
          <h3 className="font-display text-xl font-extrabold text-ink">{card.name}</h3>
        </div>
      </div>
      {card.features.length > 0 && (
        <ul className="flex flex-1 flex-col gap-2 border-y border-border py-4">
          {card.features.map((feature) => (
            <li key={feature} className="flex gap-2.5 text-ink-2">
              <Icon
                name="check"
                strokeWidth={2.6}
                className="mt-1 size-3.5 shrink-0 text-accent-text"
              />
              {feature}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex items-center justify-between gap-3">
        {/* On a phone a text link across the card with an arrow (board `App-Salon-*`). */}
        <SalonAsk
          items={ask}
          className={cx(
            ASK_BUTTON,
            'max-[760px]:w-full max-[760px]:justify-between max-[760px]:bg-transparent max-[760px]:px-0 max-[760px]:text-accent-text max-[760px]:shadow-none max-[760px]:hover:bg-transparent',
          )}
        >
          <span className="max-[760px]:hidden">Zapytaj</span>
          <span className="min-[761px]:hidden">Zapytaj o ten wariant</span>
          <Icon name="arrow" strokeWidth={2.4} className="size-4 min-[761px]:hidden" />
        </SalonAsk>
        {card.product && (
          <Link
            href={productHref(card.product.slug)}
            aria-label={`Szczegóły: ${card.product.name}`}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-extrabold text-accent-text hover:underline max-[760px]:hidden"
          >
            Szczegóły
            <Icon name="arrow" strokeWidth={2.4} className="size-4" />
          </Link>
        )}
      </div>
    </article>
  )
}

/**
 * Recommended models (`plans`, `#oferta`): the main cards, the comparison table, then the
 * secondary cards — on a phone main → secondary → table (K4-FINAL §7).
 */
export function SalonPlans({
  section,
  compare,
  brand,
  eyebrow,
  id,
}: {
  section: PlanSection
  compare: SalonView['compare']
  brand: string
  eyebrow: string
  id: string
}) {
  const mainCols =
    section.main.length === 4 ? 'min-[1200px]:grid-cols-4' : 'min-[1080px]:grid-cols-3'
  const altCols = section.alt.length === 3 ? 'min-[1080px]:grid-cols-3' : 'min-[900px]:grid-cols-2'
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="flex scroll-mt-28 flex-col gap-8">
      <SectionHead
        id={`${id}-h`}
        eyebrow={section.eyebrow ?? eyebrow}
        title={section.title ?? `${brand} — polecane modele`}
        lead={section.lead}
        note
      />
      <div className="flex flex-col gap-8">
        {section.main.length > 0 && (
          <ul className={cx('grid gap-4 pt-3 min-[761px]:grid-cols-2', mainCols, CAROUSEL)}>
            {section.main.map((card) => (
              <li key={card.name} className={cx('flex flex-col pt-3', CAROUSEL_ITEM)}>
                <PlanItem card={card} brand={brand} compact={false} big={section.big} />
              </li>
            ))}
          </ul>
        )}
        {compare && (
          <div className="order-2 max-[760px]:order-3">
            <SalonCompare compare={compare} />
          </div>
        )}
        {section.alt.length > 0 && (
          <div className="order-3 flex flex-col gap-4 max-[760px]:order-2">
            <h3 className="font-display text-xl font-extrabold text-ink">
              {section.altTitle ?? 'Też w ofercie'}
            </h3>
            <ul className={cx('grid gap-4', altCols, CAROUSEL)}>
              {section.alt.map((card) => (
                <li key={card.name} className={cx('flex flex-col', CAROUSEL_ITEM)}>
                  <PlanItem card={card} brand={brand} compact big={section.big} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

/** Dark panel of the service (green tint) or of the rollout (orange tint). */
function DarkPanel({
  id,
  tone,
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  id: string
  tone: 'ok' | 'warn'
  eyebrow: string
  title: string
  description: string | null
  actions: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section
      aria-labelledby={`${id}-h`}
      data-surface="dark"
      className="relative overflow-hidden rounded-[32px] bg-surface-dark px-5 py-9 text-white ring-1 ring-white/10 ring-inset sm:px-12 sm:py-12"
    >
      <span
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute inset-0',
          tone === 'ok'
            ? 'bg-[radial-gradient(50%_80%_at_90%_10%,color-mix(in_srgb,var(--ok)_22%,transparent),transparent_70%)]'
            : 'bg-[radial-gradient(50%_80%_at_90%_10%,color-mix(in_srgb,var(--warn)_20%,transparent),transparent_70%)]',
        )}
      />
      <div className="relative grid gap-8 min-[1080px]:grid-cols-2 min-[1080px]:items-center">
        <div className="flex flex-col gap-4">
          <Eyebrow dark>{eyebrow}</Eyebrow>
          <h2
            id={`${id}-h`}
            className="font-display text-[clamp(1.4rem,3vw,2.4rem)] leading-tight font-extrabold text-balance"
          >
            {title}
          </h2>
          {description && <p className="max-w-[60ch] text-white/80">{description}</p>}
          <div className="flex flex-wrap gap-3 pt-2">{actions}</div>
        </div>
        {children}
      </div>
    </section>
  )
}

function PanelItems({
  items,
  numbered,
}: {
  items: { title: string; text: string | null }[]
  numbered: boolean
}) {
  return (
    <ol className="grid gap-3 min-[560px]:grid-cols-2">
      {items.map((item, i) => (
        <li
          key={item.title}
          className="flex gap-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/12 ring-inset"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-ok text-sm font-extrabold text-surface-dark">
            {numbered ? i + 1 : <Icon name="check" strokeWidth={3} className="size-3.5" />}
          </span>
          <span className="flex flex-col gap-0.5">
            <b className="font-extrabold">{item.title}</b>
            {item.text && <small className="text-sm text-white/70">{item.text}</small>}
          </span>
        </li>
      ))}
    </ol>
  )
}

export function SalonService({
  service,
  phone,
}: {
  service: NonNullable<SalonView['service']>
  phone: { label: string; href: string } | null
}) {
  return (
    <DarkPanel
      id="serwis"
      tone="ok"
      eyebrow="Serwis"
      title={service.title ?? 'Serwis'}
      description={service.description}
      actions={
        <>
          <SalonAsk
            items={service.product ? [{ id: service.product.slug }] : []}
            className={LIGHT_BUTTON}
          >
            Zgłoś kasę do serwisu
          </SalonAsk>
          {phone && (
            <a href={phone.href} className={GLASS_BUTTON}>
              {phone.label}
            </a>
          )}
        </>
      }
    >
      <PanelItems items={service.items} numbered={false} />
    </DarkPanel>
  )
}

export function SalonRollout({ rollout }: { rollout: NonNullable<SalonView['rollout']> }) {
  const label = rollout.button ?? 'Zapytaj o wdrożenie'
  return (
    <DarkPanel
      id="wdrozenie"
      tone="warn"
      eyebrow="Wdrożenia"
      title={rollout.title ?? 'Wdrożenie'}
      description={rollout.description}
      actions={
        rollout.href ? (
          <Link href={rollout.href} className={LIGHT_BUTTON}>
            {label}
          </Link>
        ) : (
          <SalonAsk
            items={rollout.products.map((product) => ({ id: product.slug }))}
            className={LIGHT_BUTTON}
          >
            {label}
          </SalonAsk>
        )
      }
    >
      {rollout.steps.length > 0 ? (
        <PanelItems items={rollout.steps} numbered />
      ) : (
        <ul className="grid grid-cols-3 gap-3">
          {rollout.products.slice(0, 3).map((product) => (
            <li key={product.slug}>
              <ProductStage className="aspect-square rounded-2xl">
                <Photo product={product} className="max-h-[78%] max-w-[80%]" />
              </ProductStage>
            </li>
          ))}
        </ul>
      )}
    </DarkPanel>
  )
}

export function SalonAbout({
  about,
  headings,
}: {
  about: NonNullable<SalonView['about']>
  headings: SalonView['headings']
}) {
  const [first, ...rest] = about.paragraphs
  return (
    <section aria-labelledby="o-marce-h" className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Eyebrow>O marce</Eyebrow>
        <h2
          id="o-marce-h"
          className="font-display text-[clamp(1.4rem,3vw,2.4rem)] leading-tight font-extrabold text-balance text-ink"
        >
          {headings.facts}
        </h2>
      </div>
      <div className="grid gap-6 min-[1080px]:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] min-[1080px]:gap-8">
        {about.facts.length > 0 && (
          <dl className="grid gap-3 self-start min-[560px]:grid-cols-2">
            {about.facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-1 rounded-2xl bg-surface-2 p-4">
                <dt className="text-xs font-black tracking-[0.08em] text-ink-2 uppercase">
                  {fact.label}
                </dt>
                <dd className="font-extrabold text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div
          className={cx(
            'flex flex-col gap-4 text-ink-2',
            // Without facts the text keeps its column, as on the board.
            about.facts.length === 0 && 'min-[1080px]:col-start-2',
          )}
        >
          {first && <p className="leading-relaxed">{first}</p>}
          {rest.length > 0 && (
            <details className="group">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full bg-card px-5 text-sm font-extrabold text-ink shadow-[inset_0_0_0_1px_var(--border)] [&::-webkit-details-marker]:hidden">
                <span className="group-open:hidden">{headings.more}</span>
                <span className="hidden group-open:inline">Zwiń</span>
                <Icon
                  name="arrow"
                  strokeWidth={2.4}
                  className="size-4 rotate-90 group-open:-rotate-90"
                />
              </summary>
              <div className="flex flex-col gap-3 pt-4">
                {rest.map((paragraph) => (
                  <p key={paragraph} className="leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </details>
          )}
          {about.sources.length > 0 && (
            <p className="text-sm">
              Źródła:{' '}
              {about.sources.map((source, i) => (
                <span key={source.host}>
                  {i > 0 && ' · '}
                  <a href={source.url} rel="noopener" target="_blank" className="underline">
                    {source.host}
                  </a>
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export function SalonFaq({
  faq,
  headings,
  hasPlans,
  contact,
}: {
  faq: SalonView['faq']
  headings: SalonView['headings']
  hasPlans: boolean
  contact: string[]
}) {
  return (
    <section
      aria-labelledby="pytania-h"
      className="grid gap-8 min-[1080px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] min-[1080px]:items-start"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <Eyebrow>Pytania</Eyebrow>
          <h2
            id="pytania-h"
            className="font-display text-[clamp(1.4rem,3vw,2.4rem)] leading-tight font-extrabold text-balance text-ink"
          >
            {faq.length > 0 ? headings.faq : 'Masz pytanie?'}
          </h2>
        </div>
        {faq.length > 0 && (
          <div className="flex flex-col border-t border-border">
            {faq.map((item, i) => (
              <details key={item.question} open={i === 0} className="group border-b border-border">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-extrabold text-ink [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <Icon
                    name="arrow"
                    strokeWidth={2.4}
                    className="size-4 shrink-0 rotate-90 transition-transform group-open:-rotate-90"
                  />
                </summary>
                <p className="pb-5 leading-relaxed text-ink-2">{item.answer}</p>
              </details>
            ))}
          </div>
        )}
      </div>
      <aside
        id="sl-ask"
        aria-labelledby="sl-ask-h"
        className="flex scroll-mt-28 flex-col gap-4 rounded-3xl bg-surface-2 p-6"
      >
        <h3 id="sl-ask-h" className="font-display text-2xl font-extrabold text-ink">
          {hasPlans ? 'Nie wiesz, co wybrać?' : 'Nie wiesz, który model?'}
        </h3>
        <p className="text-ink-2">
          Napisz, czego potrzebujesz — dobierzemy model i przygotujemy ofertę na piśmie.
        </p>
        <SalonAsk
          items={[]}
          className="inline-flex min-h-[52px] items-center justify-center rounded-2xl bg-accent-text px-6 font-extrabold text-accent-ink"
        >
          {headings.ask}
        </SalonAsk>
        {contact.length > 0 && (
          <p className="text-center text-sm font-semibold text-ink-2">{contact.join(' · ')}</p>
        )}
      </aside>
    </section>
  )
}

/** Eyebrow and title of the full offer, with or without the recommended models above. */
export function familyHeading(view: SalonView) {
  return view.plans
    ? {
        eyebrow: `Pełna oferta · ${view.familyCount} ${plural(view.familyCount, ['pozycja', 'pozycje', 'pozycji'])}`,
        title: 'Wszystko w ofercie, według rodzaju',
      }
    : { eyebrow: view.headings.offer, title: 'Wszystkie urządzenia w jednym miejscu' }
}

export { SectionHead }
