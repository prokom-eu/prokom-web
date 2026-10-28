import { Container } from '@/components/ui/Container'
import { cx } from '@/components/ui/cx'
import type { ShowcaseView } from '@/lib/software/showcase'

import { SectionHead } from './SectionHead'

/**
 * „Realizacje” (`#realizacje`, spec. §4 pkt 10, board `Main`): the own systems of PRO-KOM as
 * cards with a small mock-up (HTML from tokens, decorative — board decision SW6 4) and the strip
 * of figures. Server only: on a phone the cards are a CSS carousel (84%, the next one peeking
 * in) and the figures a 2×2 grid. The mock-up follows the card's position, not its name: the
 * package lists a service system, a company site and a catalogue in this order.
 */
export function Showcase({ view }: { view: ShowcaseView }) {
  return (
    <section id="realizacje" className="scroll-mt-24 py-10 min-[640px]:py-14">
      <Container wide className="flex flex-col gap-6 min-[640px]:gap-7">
        <SectionHead eyebrow={view.eyebrow} title={view.title} lead={view.lead} />

        {view.items.length > 0 ? (
          <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] min-[641px]:mx-0 min-[641px]:grid min-[641px]:gap-4 min-[641px]:overflow-visible min-[641px]:px-0 min-[641px]:pb-0 min-[641px]:[grid-template-columns:repeat(auto-fit,minmax(300px,1fr))]">
            {view.items.map((item, index) => (
              <li key={`${index}-${item.name}`} className="flex shrink-0 basis-[84%] snap-start">
                <a
                  href={item.url}
                  rel="noopener"
                  className="group flex w-full flex-col overflow-hidden rounded-[24px] border border-border bg-card shadow-raised transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:border-accent-line motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div
                    aria-hidden="true"
                    className="h-[170px] overflow-hidden bg-[linear-gradient(160deg,var(--stage),var(--surface-2))] px-[22px] pt-[22px] min-[641px]:h-[200px]"
                  >
                    <ShowcaseMock kind={index % 3} />
                  </div>
                  <div className="flex flex-col gap-2 p-5 min-[641px]:px-6 min-[641px]:pb-6">
                    <span className="flex items-center justify-between gap-3">
                      <b className="text-lg group-hover:underline">{item.name}</b>
                      <span
                        className={cx(
                          'inline-flex items-center gap-1.5 text-xs font-extrabold',
                          item.live ? 'text-ok-text' : 'text-ink-2',
                        )}
                      >
                        <i className={cx('size-2 rounded-full', item.live ? 'bg-ok' : 'bg-warn')} />
                        {item.status}
                      </span>
                    </span>
                    <span className="text-[15px] text-ink-2">{item.text}</span>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        {view.stats.length > 0 ? (
          <ul
            className={cx(
              'grid grid-cols-2 overflow-hidden rounded-[22px] bg-surface-dark text-white min-[641px]:rounded-[28px]',
              STAT_COLUMNS[view.stats.length] ?? 'min-[1081px]:grid-cols-4',
            )}
          >
            {view.stats.map((stat, index) => (
              <li
                key={`${index}-${stat.value}`}
                className="flex flex-col gap-2 border-white/10 p-4 [&:nth-child(2n)]:border-l [&:nth-child(n+3)]:border-t min-[641px]:px-7 min-[641px]:py-[30px] min-[1081px]:[&:nth-child(n+2)]:border-l min-[1081px]:[&:nth-child(n+3)]:border-t-0"
              >
                <b className="font-display text-[30px] font-extrabold leading-none tracking-tight min-[641px]:text-[40px]">
                  {stat.value}
                </b>
                <span className="text-[12.5px] leading-snug text-white/80 min-[641px]:text-[14.5px]">
                  {stat.label}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </section>
  )
}

/**
 * One row on a computer, as many columns as figures: on production a figure without its value
 * (`[WYNIK]`) is left out, and the strip must not keep an empty column.
 */
const STAT_COLUMNS: Record<number, string> = {
  1: 'min-[1081px]:grid-cols-1',
  2: 'min-[1081px]:grid-cols-2',
  3: 'min-[1081px]:grid-cols-3',
}

const screen = 'h-full overflow-hidden rounded-t-xl bg-card text-ink shadow-raised'

/** Small picture of a working system: 0 — service panel, 1 — company site, 2 — catalogue. */
function ShowcaseMock({ kind }: { kind: number }) {
  if (kind === 0) {
    const rows: [string, string, boolean][] = [
      ['nr 2041 · Laptop · Nowak', 'gotowe', true],
      ['nr 2040 · Drukarka · Lis', 'w naprawie', false],
      ['nr 2039 · Kasa · Wójcik', 'w naprawie', false],
    ]
    return (
      <div className={cx(screen, 'flex text-[9px]')}>
        <div className="flex w-[84px] shrink-0 flex-col gap-1 bg-surface-dark p-2 font-bold text-white/70">
          <b className="mb-1 text-white">Serwis</b>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-white">Naprawy</span>
          <span className="px-1.5">Klienci</span>
          <span className="px-1.5">Magazyn</span>
          <span className="px-1.5">Raporty</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 bg-surface-2 p-2.5">
          <span className="flex justify-between text-[10px] font-extrabold">
            <span>Naprawy w toku · 12</span>
            <span className="text-ok-text">na żywo</span>
          </span>
          {rows.map(([text, status, done]) => (
            <span
              key={text}
              className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-2 py-1.5"
            >
              <span className="truncate">{text}</span>
              <span
                className={cx(
                  'shrink-0 rounded-full px-1.5 font-extrabold',
                  done ? 'bg-ok-text text-surface' : 'bg-chip text-ink-2',
                )}
              >
                {status}
              </span>
            </span>
          ))}
        </div>
      </div>
    )
  }
  if (kind === 1) {
    return (
      <div className={cx(screen, 'text-[8px]')}>
        <div className="flex items-center justify-between border-b border-border px-3 py-2 font-extrabold">
          <span>
            PRO<span className="text-accent-text">-</span>KOM
          </span>
          <span className="text-ink-2">Biznes · Instalacje · Software · Serwis</span>
        </div>
        <div className="flex gap-3 px-3 py-3.5">
          <div className="flex flex-1 flex-col gap-1.5">
            <b className="font-mock text-[15px] leading-tight">
              Technologia dla firm na Podhalu. Od 2004 r.
            </b>
            <span className="text-ink-2">Kasy, komputery, sieci, monitoring, oprogramowanie.</span>
            <span className="flex gap-1">
              <span className="rounded bg-ink px-2 py-1 font-extrabold text-surface">Zadzwoń</span>
              <span className="rounded border border-border px-2 py-1 font-extrabold">
                Nasze linie
              </span>
            </span>
          </div>
          <div className="grid w-[110px] shrink-0 grid-cols-2 gap-1.5">
            <i className="h-[34px] rounded-md bg-[image:var(--grad-area-www)]" />
            <i className="h-[34px] rounded-md bg-[image:var(--grad-area-sys)]" />
            <i className="h-[34px] rounded-md bg-[image:var(--grad-area-app)]" />
            <i className="h-[34px] rounded-md bg-[image:var(--grad-area-plug)]" />
          </div>
        </div>
      </div>
    )
  }
  const filters: [string, boolean][] = [
    ['Kasy fiskalne', true],
    ['Terminale', false],
    ['Komputery', false],
    ['Sieci', false],
  ]
  return (
    <div className={cx(screen, 'flex gap-2 bg-surface-2 p-2.5 text-[8px]')}>
      <div className="flex w-[72px] shrink-0 flex-col gap-1 font-bold text-ink-2">
        <b className="text-ink">Filtry</b>
        {filters.map(([name, on]) => (
          <span key={name} className="flex items-center gap-1">
            <i
              className={cx('size-2 rounded-sm', on ? 'bg-accent' : 'border border-border-input')}
            />
            {name}
          </span>
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex h-[18px] items-center rounded border border-border bg-card px-1.5 text-ink-2">
          Szukaj: kasa online…
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {['Kasa A', 'Kasa B', 'Kasa C'].map((name) => (
            <span key={name} className="flex flex-col gap-1 rounded-md bg-card p-1.5">
              <i className="h-7 rounded bg-surface-3" />
              <b>{name}</b>
              <span className="rounded bg-accent-soft px-1 text-center font-extrabold text-accent-text">
                Do zapytania
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
