'use client'

import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'

import { GUIDE_CATEGORIES, poradnik as T } from '../../dane/poradnik'
import { InstIcon } from '../../InstIcon'

/** A card of the guide: a post of the panel or a short answer on a service page. */
export type GuideCard = {
  key: string
  category: string
  categoryLabel: string
  title: string
  text: string
  href: string
  meta: string
}

/*
 * The category chips sit in the hero, the cards in their own section: one page state shared
 * through a tiny store (like the offer), reset when the page is left.
 */
let category = 'all'
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
function setCategory(next: string) {
  category = next
  for (const l of listeners) l()
}
const useCategory = () =>
  useSyncExternalStore(
    subscribe,
    () => category,
    () => 'all',
  )

/** The category chips (`.zpc`). */
export function GuideCategories() {
  const current = useCategory()
  useEffect(() => () => setCategory('all'), [])
  return (
    <div
      className="zpc in d4"
      style={{ marginTop: 28 }}
      role="group"
      aria-label={T.categoriesLabel}
    >
      {GUIDE_CATEGORIES.map((c) => (
        <button
          key={c.key}
          type="button"
          className={'chip' + (current === c.key ? ' on' : '')}
          aria-pressed={current === c.key}
          onClick={() => setCategory(c.key)}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}

/** The cards of the chosen category (`.prgrid`) and the empty note. */
export function GuideGrid({ cards }: { cards: GuideCard[] }) {
  const current = useCategory()
  const list = cards.filter((c) => current === 'all' || c.category === current)
  return (
    <>
      <p className="vh" aria-live="polite">
        {`Pokazujemy ${list.length} z ${cards.length} poradników`}
      </p>
      <div className="prgrid">
        {list.map((a) => (
          <Link key={a.key} href={a.href} className="card prc2">
            <span className="svk">{a.categoryLabel}</span>
            <b className="h3">{a.title}</b>
            <p>{a.text}</p>
            <span className="mut" style={{ fontSize: 13, marginTop: 'auto' }}>
              {a.meta}
            </span>
          </Link>
        ))}
      </div>
      {list.length === 0 && (
        <div className="note" style={{ marginTop: 18 }}>
          <InstIcon name="book" size={20} />
          <span>{T.empty}</span>
        </div>
      )}
    </>
  )
}
