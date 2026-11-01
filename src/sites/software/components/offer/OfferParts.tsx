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

import { OfferThumb } from './OfferThumb'

/** Parts of the offer window (spec. §5.1, `stany/okno-90…98`) — presentational only. */

export const EYEBROW = 'text-xs font-extrabold uppercase tracking-[0.14em] text-ink-2'

/** Category badge: one flat accent for every category (ADR-015 v23 pkt 3). */
export function OfferBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-lg bg-accent px-2.5 text-xs font-extrabold uppercase tracking-[0.12em] text-accent-ink">
      {children}
    </span>
  )
}

export function LiveBadge() {
  return (
    <span className="inline-flex min-h-7 items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 text-xs font-bold text-ok-text">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-ok" />
      podgląd na żywo
    </span>
  )
}

export function Fact({
  label,
  value,
  wide = false,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <div className={cx('rounded-2xl border border-border bg-card px-4 py-3', wide && 'flex-1')}>
      <dt className={EYEBROW}>{label}</dt>
      <dd
        className={cx(
          'mt-1 font-bold',
          wide ? 'text-sm text-ink' : 'font-display text-lg text-accent-text',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

/** „W cenie” card: the one „od” price, 3–5 points and „Potrzebujesz więcej?” (v22). */
export function IncludedCard({ price }: { price: Extract<OfferPrice, { kind: 'included' }> }) {
  return (
    <div className="rounded-[22px] border-2 border-accent-line bg-accent-soft p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className={EYEBROW}>W cenie</p>
        <p className="text-accent-text">
          {price.head.before && (
            <span className="font-display text-2xl font-extrabold">{price.head.before} </span>
          )}
          <span className="font-display text-3xl font-extrabold">{price.head.amount}</span>
          {price.head.after && (
            <span className="text-sm font-bold text-ink-2"> {price.head.after}</span>
          )}
        </p>
      </div>
      {price.items.length > 0 && (
        <ul className="mt-3 space-y-2">
          {price.items.map((item) => (
            <li key={item} className="flex gap-2.5 font-bold">
              <CheckBox />
              {item}
            </li>
          ))}
        </ul>
      )}
      {price.more && (
        <p className="mt-4 flex gap-2.5 rounded-2xl bg-surface-2 px-4 py-3 text-sm text-ink-2">
          <span aria-hidden="true" className="font-bold text-accent-text">
            +
          </span>
          {price.more}
        </p>
      )}
    </div>
  )
}

/** Apps and automations: no price yet — the quote comes after a short talk. */
export function AskCard({ price }: { price: Extract<OfferPrice, { kind: 'ask' }> }) {
  return (
    <div className="rounded-[22px] border-2 border-accent-line bg-accent-soft p-5">
      <p className="font-display text-2xl font-extrabold text-accent-text">{price.title}</p>
      {price.text && <p className="mt-2 text-sm text-ink-2">{price.text}</p>}
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
                'relative flex min-h-11 w-[72%] shrink-0 snap-start flex-col rounded-2xl border-2 bg-card p-3.5 text-left max-[640px]:order-[var(--phone-order)] min-[641px]:w-auto',
                on ? 'border-accent-text shadow-raised' : 'border-border',
              )}
            >
              {level.recommended && (
                <span className="absolute -top-3 left-3 rounded-md bg-ok-text px-2 py-0.5 text-xs font-extrabold text-surface">
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
    <section className={cx('rounded-[22px] border border-border bg-card p-5', className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={EYEBROW}>{title}</h3>
        {aside}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export function CheckBox() {
  return (
    <span
      aria-hidden="true"
      className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md bg-button text-accent-ink"
    >
      <Icon name="check" strokeWidth={3} className="size-3.5" />
    </span>
  )
}

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 rounded-xl bg-surface-2 px-3.5 py-2.5 font-bold">
          <CheckBox />
          {item}
        </li>
      ))}
    </ul>
  )
}

export function Steps({ steps }: { steps: OfferStep[] }) {
  return (
    <ol className="grid gap-3 min-[641px]:grid-cols-2 min-[981px]:grid-cols-4">
      {steps.map((step, i) => (
        <li key={step.name} className="rounded-2xl bg-surface-2 p-4">
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
          className="group rounded-2xl border border-border bg-surface-2 open:border-accent-line open:bg-card"
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

/** „Dobrze łączy się z”: a click switches the window to that solution. */
export function RelatedCards({
  cards,
  onPick,
}: {
  cards: RelatedCard[]
  onPick: (slug: string) => void
}) {
  return (
    <ul className="grid gap-3 min-[981px]:grid-cols-3">
      {cards.map((card) => (
        <li key={card.slug}>
          <button
            type="button"
            onClick={() => onPick(card.slug)}
            className="grid w-full grid-cols-[112px_1fr] items-center gap-3 rounded-2xl bg-surface-2 p-2.5 text-left hover:shadow-raised"
          >
            <OfferThumb src={card.thumbnail} />
            <span className="min-w-0">
              {card.label && (
                <span className="block text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text">
                  {card.label}
                </span>
              )}
              <span className="mt-0.5 block font-bold leading-snug">{card.name}</span>
              <span className="mt-1 block text-sm font-bold text-ink-2">{card.price}</span>
              <span className="sr-only"> — przejdź do szczegółów</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
