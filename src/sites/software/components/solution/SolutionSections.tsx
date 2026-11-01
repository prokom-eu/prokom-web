import Link from 'next/link'

import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import { Icon } from '@/components/ui/Icon'
import { CATALOG_PATH } from '@/lib/software/catalog'
import type { SolutionPageView } from '@/lib/software/solutionPage'

import { OfferThumb } from '../offer/OfferThumb'
import { AddToProject } from './AddToProject'

type Page = { page: SolutionPageView }

const eyebrowClass = 'text-xs font-extrabold uppercase tracking-[0.14em] text-accent-text'
const cardClass = 'rounded-[24px] bg-card shadow-[inset_0_0_0_1px_var(--border)]'

/**
 * Hero of a solution page (board `Rozwiazanie`, `stany/89a`): breadcrumbs, eyebrow, H1 with its
 * accent, lead, „Chcę takie u siebie” + „Jak to działa”, and the data tiles — price first, 2×2
 * on the phone.
 */
export function SolutionHero({ page }: Page) {
  return (
    <section aria-labelledby="rozwiazanie-h" className="pt-6 min-[641px]:pt-10">
      <Container wide>
        <nav aria-label="Okruszki" className="text-sm text-ink-2">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="inline-flex min-h-11 items-center px-1 hover:text-ink">
                Strona główna
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link
                href={CATALOG_PATH}
                className="inline-flex min-h-11 items-center px-1 hover:text-ink"
              >
                Pełna oferta
              </Link>
            </li>
            <li aria-hidden="true" className="max-[640px]:hidden">
              ›
            </li>
            <li className="max-[640px]:hidden">
              <span aria-current="page" className="inline-flex min-h-11 items-center px-1">
                {page.name}
              </span>
            </li>
          </ol>
        </nav>
        <div className="mt-3 grid gap-8 min-[1081px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] min-[1081px]:items-end">
          <div>
            <p className={eyebrowClass}>{page.eyebrow}</p>
            <h1
              id="rozwiazanie-h"
              className="mt-3 font-display text-[40px] font-extrabold leading-[1.02] tracking-tight min-[641px]:text-6xl"
            >
              {page.title.plain}
              {page.title.accent && (
                <>
                  {' '}
                  <span className="text-grad-h1">{page.title.accent}</span>
                </>
              )}
            </h1>
            {page.lead && (
              <p className="mt-5 max-w-[60ch] text-lg text-ink-2 min-[641px]:text-xl">
                {page.lead}
              </p>
            )}
            <div className="mt-7 flex flex-col gap-2.5 min-[641px]:flex-row">
              <AddToProject id={page.slug} name={page.projectName} />
              {page.howItWorks && (
                <a
                  href="#jak-dziala"
                  className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-border bg-card px-6 font-extrabold active:scale-[0.98] motion-reduce:transition-none"
                >
                  Jak to działa, krok po kroku
                </a>
              )}
            </div>
          </div>
          {/* An odd last tile takes the whole row: no 2 + 1 with a hole (audyt P1 #16). */}
          <dl className="grid grid-cols-2 gap-2.5 [&>*:last-child:nth-child(odd)]:col-span-2">
            {page.tiles.map((tile, i) => (
              <div key={i} className={cx(cardClass, 'flex flex-col p-4')}>
                <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-ink-2">
                  {tile.label}
                </dt>
                <dd
                  className={cx(
                    'mt-1.5 font-display text-xl font-extrabold leading-tight',
                    tile.accent && 'text-accent-text',
                  )}
                >
                  {tile.value}
                </dd>
                {tile.caption && <dd className="mt-1 text-sm text-ink-2">{tile.caption}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  )
}

/** „Dziś / Z aplikacją / Efekt” — three cards, the last one in the accent (board). */
export function SolutionCompare({ page }: Page) {
  if (page.compare.length === 0) return null
  return (
    <section aria-label="Dziś i po wdrożeniu" className="py-8 min-[641px]:py-12">
      <Container wide>
        <ul className="grid gap-3 min-[1081px]:grid-cols-3">
          {page.compare.map((item, i) => {
            const last = i === page.compare.length - 1 && page.compare.length > 1
            const middle = i > 0 && !last
            return (
              <li
                key={item.label}
                className={cx(
                  'rounded-[24px] p-6',
                  last
                    ? 'bg-button text-accent-ink'
                    : middle
                      ? 'border border-accent-line bg-accent-soft'
                      : cx(cardClass),
                )}
              >
                <p
                  className={cx(
                    'text-xs font-extrabold uppercase tracking-[0.14em]',
                    last ? 'opacity-90' : 'text-accent-text',
                  )}
                >
                  {item.label}
                </p>
                <p className="mt-3 font-display text-xl font-extrabold leading-snug">
                  {item.title}
                </p>
                {item.text && (
                  <p className={cx('mt-2.5 text-[15px]', last ? 'opacity-90' : 'text-ink-2')}>
                    {item.text}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      </Container>
    </section>
  )
}

/**
 * „Co dostajesz” (with the price badge and „Wyceniane osobno”) next to the choice of variant and
 * „Często łączone z” (board `Rozwiazanie`). Related cards open the solution's own page.
 */
export function SolutionOffer({ page }: Page) {
  const { deliverables, choice, related } = page
  // Only the variant choice is tall enough for a side column; „Często łączone z” alone sits
  // under „Co dostajesz” in a row, so no empty half stays beside it (audyt 01.11 P1 #16).
  const side = choice !== null
  return (
    <section aria-labelledby="co-dostajesz-h" className="py-8 min-[641px]:py-12">
      <Container
        wide
        className={cx(
          'grid gap-3',
          side && 'min-[1081px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] min-[1081px]:items-start',
        )}
      >
        <div className={cx(cardClass, 'p-5 min-[641px]:p-7')}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className={eyebrowClass}>Co dostajesz</p>
              <h2
                id="co-dostajesz-h"
                className="mt-2 font-display text-2xl font-extrabold min-[641px]:text-[28px]"
              >
                {deliverables.title}
              </h2>
            </div>
            <p className="rounded-2xl border border-accent-line bg-accent-soft px-4 py-2.5 text-right">
              <b className="block font-display text-xl font-extrabold text-accent-text">
                {deliverables.badge.value}
              </b>
              <span className="text-xs font-bold text-ink-2">{deliverables.badge.caption}</span>
            </p>
          </div>
          {deliverables.items.length > 0 && (
            <ul
              className={cx(
                'mt-5 grid gap-2.5 min-[641px]:grid-cols-2',
                !side && 'min-[1081px]:grid-cols-3',
              )}
            >
              {deliverables.items.map((item) => (
                <li
                  key={item.title}
                  className="flex gap-3 rounded-2xl p-4 shadow-[inset_0_0_0_1px_var(--border)]"
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-text"
                  >
                    <Icon name={item.icon ?? 'check'} className="size-[18px]" />
                  </span>
                  <span>
                    <b className="block font-extrabold">{item.title}</b>
                    {item.text && <span className="text-sm text-ink-2">{item.text}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {deliverables.extra.length > 0 && (
            <div className="mt-5 border-t border-border pt-5">
              <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-2">
                Wyceniane osobno
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {deliverables.extra.map((item) => (
                  <li key={item} className="rounded-xl bg-chip px-3 py-2 text-sm font-bold">
                    + {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {side && (
          <div className="flex flex-col gap-3">
            {choice && (
              <div className={cx(cardClass, 'p-5')}>
                <h2 className={eyebrowClass}>{choice.title}</h2>
                <ul className="mt-4 grid gap-2.5 min-[641px]:grid-cols-2">
                  {choice.options.map((option) => (
                    <li key={option.name} className="rounded-2xl bg-surface-2 p-4">
                      <b className="block font-extrabold">{option.name}</b>
                      {option.caption && (
                        <span className="mt-1 block text-sm text-ink-2">{option.caption}</span>
                      )}
                      <ul className="mt-2 space-y-1 text-sm text-ink-2">
                        {option.plus.map((item) => (
                          <li key={item} className="flex gap-1.5">
                            <span aria-hidden="true" className="text-ok-text">
                              ✓
                            </span>
                            {item}
                          </li>
                        ))}
                        {option.minus.map((item) => (
                          <li key={item} className="flex gap-1.5">
                            <span aria-hidden="true" className="text-warn">
                              +
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
                {choice.note && <p className="mt-3 text-sm text-ink-2">{choice.note}</p>}
              </div>
            )}
            {related.length > 0 && <Related related={related} row={false} />}
          </div>
        )}
        {!side && related.length > 0 && <Related related={related} row />}
      </Container>
    </section>
  )
}

function Related({ related, row }: { related: Page['page']['related']; row: boolean }) {
  return (
    <div className={cx(cardClass, 'p-5')}>
      <h2 className={eyebrowClass}>Często łączone z</h2>
      <ul
        className={cx(
          'mt-3 flex flex-col gap-2',
          row && 'min-[641px]:grid min-[641px]:grid-cols-3',
        )}
      >
        {related.map((card) => (
          <li key={card.slug}>
            <Link
              href={`${CATALOG_PATH}/${card.slug}`}
              className="flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 shadow-[inset_0_0_0_1px_var(--border)] hover:shadow-[inset_0_0_0_1.5px_var(--accent-line)] active:scale-[0.99] motion-reduce:transition-none"
            >
              <b className="font-extrabold">{card.name}</b>
              <span className="shrink-0 text-xs font-bold text-ink-2">{card.price}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * Page without the demo (template): the thumbnail with „Przykład z życia” and the steps
 * „Jak to wygląda” (`#jak-dziala`, the hero's second button).
 */
export function SolutionHowItWorks({ page }: Page) {
  if (page.demo || !page.howItWorks) return null
  return (
    <section
      id="jak-dziala"
      aria-labelledby="jak-dziala-h"
      className="scroll-mt-24 py-8 min-[641px]:py-12"
    >
      <Container
        wide
        className="grid gap-3 min-[1081px]:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] min-[1081px]:items-start"
      >
        <div className={cx(cardClass, 'p-5')}>
          <OfferThumb src={page.thumbnail ?? undefined} eager />
          {page.example && (
            <>
              <p className={cx(eyebrowClass, 'mt-4')}>Przykład z życia</p>
              <p className="mt-2 text-[15px] text-ink-2">{page.example}</p>
            </>
          )}
        </div>
        <div className={cx(cardClass, 'p-5 min-[641px]:p-7')}>
          <p className={eyebrowClass}>Krok po kroku</p>
          <h2
            id="jak-dziala-h"
            className="mt-2 font-display text-2xl font-extrabold min-[641px]:text-[28px]"
          >
            Jak to wygląda
          </h2>
          <ol className="mt-5 flex flex-col gap-2.5">
            {page.steps.map((step, i) => (
              <li
                key={step.name}
                className="flex gap-3 rounded-2xl p-4 shadow-[inset_0_0_0_1px_var(--border)]"
              >
                <span className="font-display text-xl font-extrabold text-accent-text">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block font-extrabold">{step.name}</b>
                  <span className="text-sm text-ink-2">{step.text}</span>
                </span>
                {step.time && (
                  <span className="shrink-0 text-xs font-bold text-ink-2">{step.time}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}
