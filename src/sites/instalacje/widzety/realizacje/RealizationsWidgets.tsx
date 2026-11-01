'use client'

import { useEffect, useSyncExternalStore } from 'react'

import { InstIcon } from '../../InstIcon'
import {
  INITIAL_REALIZATIONS,
  realizationArt,
  realizationsView,
  type RealizationItem,
  type RealizationsState,
} from './realizacjeModel'

/*
 * The filters sit in the hero, the cards in their own section: one page state shared through a
 * tiny store (like the offer), reset when the page is left.
 */

let state: RealizationsState = INITIAL_REALIZATIONS
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
function setState(next: (s: RealizationsState) => RealizationsState) {
  state = next(state)
  for (const l of listeners) l()
}
const useRealizations = () =>
  useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL_REALIZATIONS,
  )

/** Installation and object filters (`.rfil`). */
export function RealizationFilters({ items }: { items: RealizationItem[] }) {
  const st = useRealizations()
  const view = realizationsView(items, st)
  useEffect(() => () => setState(() => INITIAL_REALIZATIONS), [])
  return (
    <div className="rfil in d4">
      <div className="zpc" role="group" aria-label="Rodzaj instalacji">
        {view.serviceFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            className={'chip' + (f.on ? ' on' : '')}
            aria-pressed={f.on}
            onClick={() => setState((s) => ({ ...s, fs: f.key, more: false }))}
          >
            {f.label}
            <em>{f.count}</em>
          </button>
        ))}
      </div>
      <div className="zpc" role="group" aria-label="Rodzaj obiektu">
        {view.kindFilters.map((f) => (
          <button
            key={f.key}
            type="button"
            className={'chip' + (f.on ? ' on' : '')}
            aria-pressed={f.on}
            onClick={() => setState((s) => ({ ...s, fo: f.key, more: false }))}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/** The cards (`.rgrid`), „Pokaż wszystkie” and the empty note. */
export function RealizationGrid({ items }: { items: RealizationItem[] }) {
  const st = useRealizations()
  const view = realizationsView(items, st)
  return (
    <>
      <div className="rgrid" aria-live="polite">
        {view.list.map((r) => (
          <div key={r.id} className={'card rl' + (r.hidden ? ' xa-rlx' : '')}>
            <div className="rlimg">
              <svg viewBox="0 0 300 190" aria-hidden="true">
                <rect width="300" height="190" style={{ fill: 'var(--surface-3)' }} />
                <path
                  d={realizationArt(r)}
                  transform="translate(75 30) scale(.62)"
                  style={{
                    fill: 'none',
                    stroke: 'var(--accent-text)',
                    strokeWidth: 5,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                  }}
                />
              </svg>
            </div>
            <div className="rlb">
              {r.category && (
                <span className="tag a" style={{ alignSelf: 'flex-start' }}>
                  {r.category}
                </span>
              )}
              <b className="h3">{r.title}</b>
              {r.place && <span>{r.place}</span>}
              {r.description && (
                <span style={{ fontSize: 13.5, color: 'var(--ink-soft)' }}>{r.description}</span>
              )}
              {(r.scope || r.year) && (
                <span className="mut" style={{ fontSize: 12.5 }}>
                  {[r.scope, r.year ? `rok: ${r.year}` : null].filter(Boolean).join(' · ')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      {view.moreOn && (
        <button
          type="button"
          className="btn btn-g xa-rlmore"
          aria-expanded={st.more}
          onClick={() => setState((s) => ({ ...s, more: !s.more }))}
        >
          {view.moreLabel}
        </button>
      )}
      {view.empty && (
        <div className="note" style={{ marginTop: 18 }}>
          <InstIcon name="eye" size={20} />
          <span>Brak realizacji dla tego filtra. Wkrótce dodamy kolejne.</span>
        </div>
      )}
    </>
  )
}
