import type { CSSProperties, ReactNode } from 'react'

import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import type {
  OfferCell,
  OfferLevel,
  OfferPrice,
  OfferStep,
  RelatedCard,
} from '@/lib/software/offer'

import { Mockup } from '../mockups/Mockup'
import { OfferThumb } from './OfferThumb'

/** Parts of the offer window (ZMIANY-v24 §6.1, v24 glass look) — presentational only. */

export const EYEBROW = 'sw-eyebrow'

/** Category badge: one flat accent for every category (ADR-015 v23 pkt 3). */
export function OfferBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full bg-accent-soft px-3 text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text">
      {children}
    </span>
  )
}

export function LiveBadge() {
  return (
    <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-bold text-ok-text">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-ok" />
      podgląd na żywo
    </span>
  )
}

export type HeroPrice =
  { kind: 'amount'; before: string; amount: string; after: string } | { kind: 'text'; text: string }

/**
 * The price as the hero of the window (OKNO-OFERTY-PREMIUM §2.1 A): „od 2 490 zł” big in the
 * display face, „netto” small, a thin accent line under it; the term and care as two rows with an
 * icon (no tiles); „what happens next” as three short points.
 */
export function PriceHero({
  price,
  termLabel,
  term,
  careFrom,
  next,
}: {
  price: HeroPrice | null
  termLabel: string
  term: string | null
  careFrom: string | null
  next: readonly string[]
}) {
  return (
    <div className="sw-offer-hero mt-6">
      <dl className="flex flex-col gap-3">
        {price && (
          <div data-offer-price>
            <dt className="sr-only">Cena</dt>
            <dd className="sw-offer-price">
              {price.kind === 'amount' ? (
                <>
                  {price.before && <span className="sw-offer-price-small">{price.before} </span>}
                  <b className="sw-offer-price-big">{price.amount}</b>
                  {price.after && <span className="sw-offer-price-small"> {price.after}</span>}
                </>
              ) : (
                <b className="sw-offer-price-big sw-offer-price-text">{price.text}</b>
              )}
            </dd>
          </div>
        )}
        {term && (
          <div className="sw-offer-fact">
            <dt className="flex items-center gap-2">
              <Icon name="clock" className="size-[18px] text-accent-text" />
              {termLabel}
            </dt>
            <dd>{term}</dd>
          </div>
        )}
        {careFrom && (
          <div className="sw-offer-fact">
            <dt className="flex items-center gap-2">
              <Icon name="lifebuoy" className="size-[18px] text-accent-text" />
              Opieka
            </dt>
            <dd>{careFrom}</dd>
          </div>
        )}
      </dl>
      {next.length > 0 && (
        <div className="sw-offer-next">
          <p className="sr-only">Co dalej</p>
          <ul className="flex flex-col gap-1.5 text-sm text-ink-2">
            {next.map((item) => (
              <li key={item} className="flex gap-2">
                <CheckDot small />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/** A point of „W cenie” with its number on the mock-up (`null`: no area there, a plain point). */
export type IncludedPoint = { text: string; number: number | null }

/**
 * „W cenie” (OKNO-OFERTY-PREMIUM §2.2): what the „od” price includes. A point with an area on
 * the mock-up carries its number; a hover or the focus lights the area, a tap does it too and
 * brings the mock-up into view on the phone. Then „Potrzebujesz więcej?”: chips of the extras
 * (no prices — quoted in writing) or, without them, the sentence as before.
 */
export function IncludedPoints({
  points,
  more,
  extras,
  chosen,
  onLight,
  onShow,
  onToggleExtra,
}: {
  points: readonly IncludedPoint[]
  more: string | null
  extras: readonly string[]
  chosen: readonly string[]
  onLight: (number: number | null) => void
  onShow: (number: number) => void
  onToggleExtra: (extra: string) => void
}) {
  if (points.length === 0 && !more && extras.length === 0) return null
  return (
    <div>
      <h3 className={EYEBROW}>W cenie</h3>
      {points.length > 0 && (
        <ul className="sw-offer-points mt-3">
          {points.map((point) => (
            <li key={point.text} id={point.number ? `oferta-punkt-${point.number}` : undefined}>
              {point.number ? (
                <button
                  type="button"
                  data-point={point.number}
                  onMouseEnter={() => onLight(point.number)}
                  onMouseLeave={() => onLight(null)}
                  onFocus={() => onLight(point.number)}
                  onBlur={() => onLight(null)}
                  onClick={() => point.number && onShow(point.number)}
                  aria-describedby="oferta-punkty-opis"
                >
                  <span aria-hidden="true" className="sw-offer-point-number">
                    {point.number}
                  </span>
                  {point.text}
                </button>
              ) : (
                <span>
                  <CheckDot />
                  {point.text}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      {points.some((point) => point.number) && (
        <p id="oferta-punkty-opis" className="sr-only">
          Pokazuje to miejsce na makiecie.
        </p>
      )}
      {extras.length > 0 ? (
        <div className="mt-5">
          <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-bold">
            Potrzebujesz więcej?
            <span className="font-normal text-ink-2">Dodaj do zapytania — wycenimy w 5–7 dni.</span>
          </p>
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Potrzebujesz więcej?">
            {extras.map((extra) => {
              const on = chosen.includes(extra)
              return (
                <li key={extra}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => onToggleExtra(extra)}
                    className="sw-chip sw-offer-extra"
                  >
                    <span aria-hidden="true">{on ? '✓' : '+'}</span>
                    {extra}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        more && (
          <p className="mt-4 flex gap-2.5 text-sm text-ink-2">
            <span aria-hidden="true" className="font-bold text-accent-text">
              +
            </span>
            {more}
          </p>
        )
      )}
    </div>
  )
}

/** „Przykład z życia” — the only card left: a quote with a line on the left (§2.3 F). */
export function ExampleQuote({ text }: { text: string }) {
  return (
    <figure className="sw-offer-quote">
      <figcaption className={EYEBROW}>Przykład z życia</figcaption>
      <blockquote className="mt-2 text-ink-2">{text}</blockquote>
    </figure>
  )
}

/** Apps and automations: no price yet — the quote comes after a short talk. */
export function AskCard({ price }: { price: Extract<OfferPrice, { kind: 'ask' }> }) {
  if (!price.text && !price.note) return null
  return (
    <div>
      {/* The title („Zapytaj o wycenę”) is the window's hero price already (§2.1). */}
      {price.text && <p className="text-sm text-ink-2">{price.text}</p>}
      {price.note && <p className="mt-2 text-xs font-bold text-ink">{price.note}</p>}
    </div>
  )
}

/** Levels of care / kinds of audit: cards with price and time, „Polecamy” on the recommended. */
export function LevelChoice({
  title,
  levels,
  selected,
  onPick,
}: {
  title: string | null
  levels: OfferLevel[]
  selected: number
  onPick: (index: number) => void
}) {
  // Phone: the recommended one first in the row (spec. §5.1).
  const order = levels.map((_, i) => i)
  const recommended = levels.findIndex((level) => level.recommended)
  const phoneOrder =
    recommended > 0 ? [recommended, ...order.filter((i) => i !== recommended)] : order
  return (
    <div>
      {title && <p className={EYEBROW}>{title}</p>}
      <div
        role="group"
        aria-label={title ?? 'Poziom'}
        className="relative -mx-4 mt-2 flex snap-x gap-3 overflow-x-auto px-4 pb-1 pt-3 [scrollbar-width:none] min-[641px]:mx-0 min-[641px]:grid min-[641px]:grid-cols-3 min-[641px]:overflow-visible min-[641px]:px-0"
      >
        {levels.map((level, i) => {
          const on = i === selected
          return (
            <button
              key={level.name}
              type="button"
              aria-pressed={on}
              onClick={() => onPick(i)}
              // Only the phone row reorders; an inline `order` would win over the desktop grid.
              style={{ '--phone-order': phoneOrder.indexOf(i) } as CSSProperties}
              className={cx(
                'sw-glass relative flex min-h-11 w-[72%] shrink-0 snap-start flex-col rounded-[18px] p-3.5 text-left max-[640px]:order-[var(--phone-order)] min-[641px]:w-auto',
                on && 'sw-glass-featured',
              )}
            >
              {level.recommended && (
                <span className="absolute -top-3 left-3 rounded-full bg-accent px-2.5 py-0.5 text-xs font-extrabold text-accent-ink">
                  Polecamy
                </span>
              )}
              <span className="flex items-start justify-between gap-2 font-bold">
                {level.name}
                <span
                  aria-hidden="true"
                  className={cx(
                    'mt-0.5 size-5 shrink-0 rounded-full border-2',
                    on
                      ? 'border-accent-text bg-[radial-gradient(var(--accent-text)_40%,transparent_45%)]'
                      : 'border-border',
                  )}
                />
              </span>
              <span className="mt-1 text-accent-text">
                <b className="font-display text-xl font-extrabold">{level.amount}</b>{' '}
                <small className="text-xs font-bold text-ink-2">{level.suffix}</small>
              </span>
              {level.term && (
                <span className="mt-1 flex gap-1.5 text-xs font-bold text-ink-2">
                  <Icon name="clock" className="mt-px size-3.5 shrink-0" />
                  {level.term}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Cell({ cell, on }: { cell: OfferCell; on: boolean }) {
  const base = cx('px-3 py-2.5 text-center text-sm', on && 'bg-accent-soft')
  if (cell.kind === 'text') return <td className={cx(base, 'font-bold')}>{cell.text}</td>
  if (cell.kind === 'yes') {
    return (
      <td className={base}>
        <Icon name="check" strokeWidth={2.6} className="mx-auto size-4 text-ok-text" />
        <span className="sr-only">jest</span>
      </td>
    )
  }
  if (cell.kind === 'more') {
    return (
      <td className={cx(base, 'font-bold text-accent-text')}>
        + dochodzi<span className="sr-only"> na tym poziomie</span>
      </td>
    )
  }
  return (
    <td className={cx(base, 'text-ink-3')}>
      <span aria-hidden="true">—</span>
      <span className="sr-only">brak</span>
    </td>
  )
}

/** The comparison table — only for care and audit (spec. §5.1); a click on a column picks it. */
export function CompareTable({
  title,
  first,
  levels,
  rows,
  selected,
  onPick,
}: {
  title: string
  first: string
  levels: OfferLevel[]
  rows: { label: string; cells: OfferCell[] }[]
  selected: number
  onPick: (index: number) => void
}) {
  return (
    <OfferSection
      title={title}
      aside={<span className="text-xs text-ink-2">Kliknij kolumnę, żeby wybrać</span>}
    >
      <div className="relative -mx-1 overflow-x-auto">
        <table className="w-full min-w-[480px] border-collapse">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className={cx(EYEBROW, 'px-3 py-2 text-left')}>
                {first}
              </th>
              {levels.map((level, i) => (
                <th
                  key={level.name}
                  scope="col"
                  className={cx('p-0', i === selected && 'bg-accent-soft')}
                >
                  <button
                    type="button"
                    aria-pressed={i === selected}
                    onClick={() => onPick(i)}
                    className="flex min-h-11 w-full flex-col items-center justify-center px-2 py-2 text-sm font-bold"
                  >
                    {level.columnName}
                    <span className="text-accent-text">{level.amount}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border last:border-0">
                <th scope="row" className="px-3 py-2.5 text-left text-sm font-bold">
                  {row.label}
                </th>
                {row.cells.map((cell, i) => (
                  <Cell key={i} cell={cell} on={i === selected} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </OfferSection>
  )
}

/**
 * A part of the window's details: one layer, no boxed card (OKNO-OFERTY-PREMIUM §2.3 B) — an
 * eyebrow heading and the content; parts sit apart by space and a thin line (`.sw-offer-part`).
 */
export function OfferSection({
  title,
  aside,
  className,
  children,
}: {
  title: string
  aside?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cx('sw-offer-part', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={EYEBROW}>{title}</h3>
        {aside}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

/** A „✓” in a circle of the accent (§2.3 C) — a sign, not a box to tick. */
export function CheckDot({ small = false }: { small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full border border-accent-line text-accent-text',
        small ? 'mt-0.5 size-4' : 'mt-0.5 size-5',
      )}
    >
      <Icon name="check" strokeWidth={3} className={small ? 'size-2.5' : 'size-3'} />
    </span>
  )
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-1.5 min-[1200px]:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 py-1 font-bold">
          <CheckDot />
          {item}
        </li>
      ))}
    </ul>
  )
}

export function Steps({ steps }: { steps: OfferStep[] }) {
  return (
    <ol className="grid gap-4 min-[641px]:grid-cols-2">
      {steps.map((step, i) => (
        <li key={step.name} className="sw-offer-step">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-button font-extrabold text-accent-ink">
              {i + 1}
            </span>
            {step.time && (
              <span className="rounded-full bg-card px-2.5 py-1 text-xs font-bold text-accent-text">
                {step.time}
              </span>
            )}
          </div>
          <p className="mt-3 font-bold">{step.name}</p>
          <p className="mt-1 text-sm text-ink-2">{step.text}</p>
        </li>
      ))}
    </ol>
  )
}

export function Questions({ faq }: { faq: { q: string; a: string }[] }) {
  return (
    <div className="space-y-2">
      {faq.map((item, i) => (
        <details
          key={item.q}
          open={i === 0}
          className="group rounded-[18px] border border-border open:border-accent-line"
        >
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-bold [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden="true"
              className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-card font-extrabold text-accent-text group-open:bg-accent-soft"
            >
              <span className="group-open:hidden">+</span>
              <span className="hidden group-open:inline">−</span>
            </span>
          </summary>
          <p className="px-4 pb-4 text-sm text-ink-2">{item.a}</p>
        </details>
      ))}
    </div>
  )
}

/** „Często łączone z”: a click switches the window to that solution. */
export function RelatedCards({
  cards,
  onPick,
}: {
  cards: RelatedCard[]
  onPick: (slug: string) => void
}) {
  return (
    // Cards side by side as many as fit (mock-up on top, the text under it), so long names never
    // squeeze next to a picture (odbiór SWA7, 08.11).
    <ul className="sw-offer-related">
      {cards.map((card) => (
        <li key={card.slug}>
          <button
            type="button"
            onClick={() => onPick(card.slug)}
            data-card=""
            className="sw-glass sw-offer-related-card"
          >
            {card.preview ? (
              <span className="sw-offer-related-pic">
                <Mockup kind={card.preview.kind} variant={card.preview.variant} fit="contain" />
              </span>
            ) : (
              <OfferThumb src={card.thumbnail} />
            )}
            <span className="flex min-w-0 flex-1 flex-col">
              {card.label && (
                <span className="text-[11px] font-extrabold tracking-[0.14em] text-accent-text uppercase">
                  {card.label}
                </span>
              )}
              <span className="mt-1 font-display text-[17px] leading-snug font-extrabold text-balance">
                {card.name}
              </span>
              <span className="mt-auto pt-3 text-sm font-bold text-ink-2">{card.price}</span>
              <span className="sr-only"> — przejdź do szczegółów</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
