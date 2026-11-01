'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'

import { oferta as T } from '../../dane/oferta'
import { InstIcon } from '../../InstIcon'
import {
  INITIAL_OFFER,
  OFFER_OBJECTS,
  offerView,
  type OfferArea,
  type OfferState,
} from './offerModel'

/*
 * The search bar sits in the hero, the list in its own section: they share the state of the page
 * (the prototype keeps both in one page state) through a tiny store, reset when the page is left.
 */

let state: OfferState = INITIAL_OFFER
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
function setOffer(next: (s: OfferState) => OfferState) {
  state = next(state)
  for (const l of listeners) l()
}
function useOffer(): OfferState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => INITIAL_OFFER,
  )
}

/** Search, object chips and the count (`.ofbar`). */
export function OfferBar({ areas }: { areas: OfferArea[] }) {
  const st = useOffer()
  const view = offerView(areas, st)
  useEffect(() => () => setOffer(() => INITIAL_OFFER), [])
  const count = T.count(view.shown, view.total)
  return (
    <div className="ofbar in d4">
      <label className="ofs">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.6-3.6" />
        </svg>
        <input
          type="search"
          placeholder={T.search.placeholder}
          aria-label={T.search.label}
          value={st.q}
          onChange={(e) => {
            const q = e.target.value
            setOffer((s) => ({ ...s, q }))
          }}
        />
        {st.q && (
          <button
            type="button"
            className="ofx"
            aria-label={T.search.clear}
            onClick={() => setOffer((s) => ({ ...s, q: '' }))}
          >
            ×
          </button>
        )}
      </label>
      <div className="uschips ofo" role="group" aria-label={T.objects.label}>
        {[
          { key: '' as const, label: T.objects.all, icon: 'layers' as const },
          ...OFFER_OBJECTS,
        ].map((o) => (
          <button
            key={o.key || 'all'}
            type="button"
            className={'uchip' + (st.o === o.key ? ' on' : '')}
            aria-pressed={st.o === o.key}
            onClick={() => setOffer((s) => ({ ...s, o: o.key }))}
          >
            <InstIcon name={o.icon} size={16} />
            {o.label}
          </button>
        ))}
      </div>
      <div className="ofcnt" aria-live="polite">
        {count.before}
        <b>{count.shown}</b>
        {count.after}
        {view.filtered && (
          <>
            {' · '}
            <button type="button" onClick={() => setOffer(() => INITIAL_OFFER)}>
              {T.reset}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/** The navigation of areas and the areas with their solutions (`#lista`). */
export function OfferList({ areas }: { areas: OfferArea[] }) {
  const st = useOffer()
  const view = offerView(areas, st)
  return (
    <div className="wrap ofw">
      <nav className="ofnav" aria-label={T.nav.label}>
        <span className="usl" style={{ width: 'auto', marginBottom: 6 }}>
          {T.nav.title}
        </span>
        {view.areas.map((a) => (
          <a key={a.key} href={'#' + a.id} className={'ofn' + (a.count ? '' : ' off')}>
            {a.icon && <InstIcon name={a.icon} size={17} />}
            <span>{a.name}</span>
            <em>{a.count}</em>
          </a>
        ))}
        <Link href="/zaplanuj" className="btn btn-p btn-s" style={{ marginTop: 12 }}>
          {T.nav.plan}
        </Link>
      </nav>
      <div className="oflist">
        {view.areas.map((a) => (
          <article
            key={a.key}
            id={a.id}
            className={'ofa ri' + (a.extra ? ' extra' : '') + (a.hidden ? ' hide' : '')}
          >
            <header className="ofah">
              <span className="ico">{a.icon && <InstIcon name={a.icon} size={24} />}</span>
              <div className="ofat">
                <span className="svk">{a.family}</span>
                <h2 className="h3" style={{ fontSize: 26, margin: 0 }}>
                  {a.name}
                </h2>
                <p>{a.description}</p>
              </div>
              {a.href && (
                <Link href={a.href} className="btn btn-g btn-s ofgo">
                  {T.area.page}
                </Link>
              )}
            </header>
            {a.brands.length > 0 && (
              <div className="ofb">
                <span>{T.area.brands}</span>
                {a.brands.map((b) => (
                  <span key={b} className="tag">
                    {b}
                  </span>
                ))}
              </div>
            )}
            <div className="ofg">
              {a.items.map((i) => (
                <div key={i.name} className="ofi">
                  <b>{i.name}</b>
                  <span>{i.description}</span>
                  <div className="ofit">
                    {i.tags.map((t) => (
                      <em key={t}>{t}</em>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {(a.more || a.less) && (
              <button
                type="button"
                className="btn btn-g btn-s xa-ofmore"
                aria-expanded={a.less}
                onClick={() =>
                  setOffer((s) => ({ ...s, open: { ...s.open, [a.key]: !s.open[a.key] } }))
                }
              >
                {a.more ? T.area.more(a.count) : T.area.less}
              </button>
            )}
          </article>
        ))}
        {view.empty && (
          <div className="note">
            <InstIcon name="eye" size={20} />
            <span>
              {T.empty.before}
              <Link href="/zaplanuj" style={{ color: 'var(--accent-text)', fontWeight: 800 }}>
                {T.empty.link}
              </Link>
              {T.empty.after}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
