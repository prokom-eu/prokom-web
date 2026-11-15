'use client'

import Link from 'next/link'
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { BottomSheet } from '@/components/BottomSheet'
import { SlidingPill } from '@/components/motion/SlidingPill'

import { oferta as T } from '../../dane/oferta'
import { InstIcon } from '../../InstIcon'
import {
  INITIAL_OFFER,
  OFFER_OBJECTS,
  offerHighlight,
  offerView,
  type OfferArea,
  type OfferCategory,
  type OfferState,
} from './offerModel'

/*
 * The search bar sits in the hero, the filters stick to the top of the list, the list has its own
 * section: they share the state of the page (the prototype keeps it in one page state) through a
 * tiny store, reset when the page is left. RUNDA-V5 §8.
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

const HINT_MS = 3000
const CHIPS: { key: OfferCategory | ''; label: string; icon: string }[] = [
  { key: '', label: T.objects.all, icon: 'layers' },
  ...OFFER_OBJECTS,
]

function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
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
  )
}

/** The search field (hero: large, with changing examples; sticky bar on a phone: compact). */
function SearchField({ compact = false }: { compact?: boolean }) {
  const st = useOffer()
  const [hint, setHint] = useState(-1)
  const [focused, setFocused] = useState(false)
  const rotate = !compact && !focused && !st.q
  useEffect(() => {
    if (!rotate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setHint((i) => (i + 1) % T.search.hints.length), HINT_MS)
    return () => window.clearInterval(id)
  }, [rotate])
  const placeholder = compact
    ? T.search.label
    : hint >= 0
      ? `${T.search.hint}${T.search.hints[hint]}`
      : T.search.placeholder
  return (
    <label className={compact ? 'ofs ofs-c' : 'ofs'}>
      <SearchIcon />
      <input
        type="search"
        placeholder={placeholder}
        aria-label={T.search.label}
        value={st.q}
        enterKeyHint="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
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
  )
}

/** Object chips with a pill that slides under the chosen one. */
function Chips({ onPick }: { onPick?: () => void }) {
  const st = useOffer()
  const list = useRef<HTMLDivElement>(null)
  return (
    <div ref={list} className="uschips ofo" role="group" aria-label={T.objects.label}>
      <SlidingPill container={list} active={st.o} className="inst-pill" radius={999} />
      {CHIPS.map((o) => (
        <button
          key={o.key || 'all'}
          type="button"
          className={'uchip' + (st.o === o.key ? ' on' : '')}
          aria-pressed={st.o === o.key}
          onClick={() => {
            setOffer((s) => ({ ...s, o: o.key }))
            onPick?.()
          }}
        >
          <InstIcon name={o.icon} size={16} />
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Search and the count in the hero (`.ofbar`); `?q=` (the 404 search) starts the search. */
export function OfferBar({ areas }: { areas: OfferArea[] }) {
  const st = useOffer()
  const view = offerView(areas, st)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q')?.trim()
    if (q) setOffer((s) => ({ ...s, q: q.slice(0, 100) }))
    return () => setOffer(() => INITIAL_OFFER)
  }, [])
  const count = T.count(view.shown, view.total)
  return (
    <div className="ofbar in d4">
      <SearchField />
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

/**
 * The filter bar stuck under the header while the list scrolls: chips on a computer; on a phone
 * the compact search and „Filtry”, which opens the chips in a sheet.
 */
export function OfferFilters({ areas }: { areas: OfferArea[] }) {
  const st = useOffer()
  const view = offerView(areas, st)
  const [sheet, setSheet] = useState(false)
  // The compact search appears once the hero's search has scrolled away (RUNDA-V5 §8), so a
  // phone never shows two search fields at once.
  const [heroGone, setHeroGone] = useState(false)
  useEffect(() => {
    const hero = document.querySelector('.ofbar')
    if (!hero || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setHeroGone(!entry?.isIntersecting))
    io.observe(hero)
    return () => io.disconnect()
  }, [])
  const chosen = CHIPS.find((c) => c.key === st.o)
  return (
    <div className="ofsticky">
      <div className="wrap ofsbar">
        <div className="ofs-desk">
          <Chips />
        </div>
        <div className="ofs-phone">
          {heroGone ? <SearchField compact /> : <span className="ofs-gap" />}
          <button
            type="button"
            className={'ofsf' + (st.o ? ' on' : '')}
            aria-haspopup="dialog"
            onClick={() => setSheet(true)}
          >
            <InstIcon name="sliders" size={18} />
            {st.o && chosen ? chosen.label : T.filters.open}
          </button>
        </div>
        <span className="ofscnt" aria-hidden="true">
          <b>{view.shown}</b> / {view.total}
        </span>
      </div>
      <BottomSheet
        open={sheet}
        onClose={() => setSheet(false)}
        title={T.filters.title}
        desktopQuery="(min-width: 761px)"
        dragToClose
      >
        <div className="ofsheet">
          <Chips onPick={() => setSheet(false)} />
          <button type="button" className="btn btn-p ofsheet-go" onClick={() => setSheet(false)}>
            {T.filters.show(view.shown)}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}

/** A solution title with the words the search matched marked. */
function Marked({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>
  return (
    <>
      {offerHighlight(text, q).map((part, i) =>
        part.hit ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>,
      )}
    </>
  )
}

type ListProps = {
  areas: OfferArea[]
  /** Small illustrations of the services (rendered on the server), by area key. */
  scenes?: Record<string, ReactNode>
  /** Accent of each service (`--h`, a panel value), by area key. */
  hues?: Record<string, string | null>
}

/** The navigation of areas and the areas with their solutions (`#lista`). */
export function OfferList({ areas, scenes = {}, hues = {} }: ListProps) {
  const st = useOffer()
  const view = offerView(areas, st)
  const timelines = view.areas.map((_, i) => `--oa${i}`).join(', ')
  return (
    <div className="wrap ofw" style={{ timelineScope: timelines } as CSSProperties}>
      <nav className="ofnav" aria-label={T.nav.label}>
        <span className="usl" style={{ width: 'auto', marginBottom: 6 }}>
          {T.nav.title}
        </span>
        {view.areas.map((a, i) => (
          <a
            key={a.key}
            href={'#' + a.id}
            className={'ofn' + (a.count ? '' : ' off')}
            style={{ '--tl': `--oa${i}`, '--h': hues[a.key] ?? undefined } as CSSProperties}
          >
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
        {view.areas.map((a, i) => (
          <article
            key={a.key}
            id={a.id}
            className={'ofa ri' + (a.extra ? ' extra' : '') + (a.hidden ? ' hide' : '')}
            style={
              { viewTimelineName: `--oa${i}`, '--h': hues[a.key] ?? undefined } as CSSProperties
            }
          >
            <header className="ofah">
              {scenes[a.key] ? (
                <div className="ofsc" aria-hidden="true" data-inst-sx="">
                  {scenes[a.key]}
                </div>
              ) : (
                <span className="ico">{a.icon && <InstIcon name={a.icon} size={24} />}</span>
              )}
              <div className="ofat">
                <span className="svk">
                  {scenes[a.key] && a.icon ? <InstIcon name={a.icon} size={15} /> : null}
                  {a.family}
                </span>
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
            {/* Keyed by what is shown: changed results fade in again, unchanged ones stay. */}
            <div key={a.items.map((i) => (i.hidden ? '' : i.name)).join('|')} className="ofg">
              {a.items.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className={'ofi' + (item.hidden ? ' xa-ofx' : '')}
                  style={{ '--k': index } as CSSProperties}
                >
                  <b>
                    <Marked text={item.name} q={st.q} />
                  </b>
                  <span>{item.description}</span>
                  <div className="ofit">
                    {item.tags.map((t) => (
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
          <div className="ofempty">
            <InstIcon name="eye" size={24} />
            <div>
              <b>{T.empty.heading}</b>
              <p>{T.empty.text}</p>
            </div>
            <Link
              href={
                st.q.trim()
                  ? `/zaplanuj?opis=${encodeURIComponent(st.q.trim().slice(0, 200))}`
                  : '/zaplanuj'
              }
              className="btn btn-p"
            >
              {T.empty.button} <InstIcon name="arrow" size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
