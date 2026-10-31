'use client'

import { type KeyboardEvent, useId, useRef, useState } from 'react'

import { cx } from '@/components/ui/cx'
import type { PricingTab } from '@/lib/software/pricing'
import { tabKeyTarget } from '@/sites/software/components/home/tabs'

type Props = {
  tabs: (PricingTab & { note: string | null })[]
}

/**
 * „Wybierz, czego szukasz.” (board `Cennik`, stan `89b`): the solutions in the catalog's tabs —
 * a table on the desktop (rozwiązanie · cena i termin · W cenie), cards on the phone. ARIA tabs
 * with the start page's keyboard (arrows, Home, End).
 */
export function PricingTable({ tabs }: Props) {
  const id = useId()
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const tab = tabs[active] ?? tabs[0]
  if (!tab) return null

  const onKeyDown = (event: KeyboardEvent) => {
    const next = tabKeyTarget(event.key, active, tabs.length)
    if (next === null) return
    event.preventDefault()
    setActive(next)
    refs.current[next]?.focus()
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        role="tablist"
        aria-label="Kategorie cennika"
        onKeyDown={onKeyDown}
        className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] min-[641px]:mx-0 min-[641px]:flex-wrap min-[641px]:overflow-visible min-[641px]:p-0"
      >
        {tabs.map((item, i) => {
          const selected = i === active
          return (
            <button
              key={item.slug}
              ref={(element) => {
                refs.current[i] = element
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={selected}
              aria-controls={`${id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={cx(
                'inline-flex min-h-12 shrink-0 snap-start items-center gap-2 rounded-full border px-4 font-extrabold active:scale-[0.98] motion-reduce:transition-none',
                selected
                  ? 'border-button bg-button text-accent-ink'
                  : 'border-border bg-card text-ink hover:border-accent-line',
              )}
            >
              {item.name}
              <span
                className={cx(
                  'rounded-full px-2 py-0.5 text-xs',
                  selected ? 'bg-white/20' : 'bg-chip text-ink-2',
                )}
              >
                {item.rows.length}
              </span>
            </button>
          )
        })}
      </div>

      <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`}>
        {tab.note ? <p className="mb-4 max-w-[80ch] text-[15px] text-ink-2">{tab.note}</p> : null}
        <div className="overflow-hidden min-[1081px]:rounded-[26px] min-[1081px]:bg-card min-[1081px]:shadow-[inset_0_0_0_1px_var(--border)]">
          <div
            aria-hidden="true"
            className="hidden grid-cols-[minmax(0,1.1fr)_minmax(0,0.5fr)_minmax(0,1fr)] gap-4 border-b border-border px-6 py-4 text-xs font-extrabold uppercase tracking-[0.12em] text-ink-2 min-[1081px]:grid"
          >
            <span>Rozwiązanie</span>
            <span>Cena netto i termin</span>
          </div>
          <ul className="flex flex-col gap-2.5 min-[1081px]:gap-0">
            {tab.rows.map((row) => (
              <li
                key={row.slug}
                className="grid gap-3 rounded-[22px] bg-card p-4 shadow-[inset_0_0_0_1px_var(--border)] min-[1081px]:grid-cols-[minmax(0,1.1fr)_minmax(0,0.5fr)_minmax(0,1fr)] min-[1081px]:items-center min-[1081px]:gap-4 min-[1081px]:rounded-none min-[1081px]:border-b min-[1081px]:border-border min-[1081px]:px-6 min-[1081px]:py-5 min-[1081px]:shadow-none min-[1081px]:last:border-b-0"
              >
                <div>
                  <h3 className="text-[17px] font-extrabold">{row.name}</h3>
                  {row.lead ? <p className="mt-1 text-sm text-ink-2">{row.lead}</p> : null}
                  {row.note ? (
                    <p className="mt-1 text-[13px] font-bold text-accent-text">{row.note}</p>
                  ) : null}
                </div>
                <p className="flex flex-col rounded-2xl bg-surface-2 px-3.5 py-2.5 shadow-[inset_0_0_0_1px_var(--border)]">
                  <b
                    className={cx(
                      'font-display text-lg font-extrabold',
                      row.ask ? 'text-ink' : 'text-accent-text',
                    )}
                  >
                    {row.price}
                  </b>
                  <span className="text-[13px] font-bold">{row.term}</span>
                </p>
                {row.included ? (
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-accent-text">
                      W cenie
                    </p>
                    <p className="mt-1 text-sm text-ink-2">{row.included}</p>
                  </div>
                ) : (
                  <span aria-hidden="true" className="max-[1080px]:hidden" />
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
