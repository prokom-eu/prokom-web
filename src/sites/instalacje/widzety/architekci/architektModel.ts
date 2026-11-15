import type { ServiceKey } from '@/lib/instalacje/options'

import { architekci as A, type ChecklistObject, type NewsFilter } from '../../dane/architekci'

/*
 * Logic of the „Dla architektów” sections, ported 1:1 from `zrodlo/pages/Architekci.js`
 * (`page()`: checklist `ck`, „Nowe rozwiązania” `nw`) as pure functions; `architektModel.test.ts`
 * runs the original page and compares.
 */

// ── Checklist (`ck`) ────────────────────────────────────────────────────────────────────

export type ChecklistState = {
  obj: ChecklistObject
  sys: readonly ServiceKey[]
  /** Ticked items by their text (`done`). */
  done: readonly string[]
}

/** The prototype's start (`obj: 'dom'`, `sys: [...]`, nothing ticked). */
export const INITIAL_CHECKLIST: ChecklistState = {
  obj: 'dom',
  sys: ['wifi', 'kam', 'smart', 'snd', 'scr', 'ev'],
  done: [],
}

/** Items for the chosen object and systems, in package order (`list`). */
export const checklistItems = (s: ChecklistState) =>
  A.checklist.items.filter((r) => s.sys.includes(r.system) && r.objects.includes(s.obj))

/** Items grouped by phase; phases without items are left out (`ph`). */
export const checklistPhases = (s: ChecklistState) => {
  const list = checklistItems(s)
  return A.checklist.phases
    .map((p) => ({ ...p, items: list.filter((r) => r.phase === p.key) }))
    .filter((p) => p.items.length > 0)
}

/** Ticked items of the current list and the bar width in % (`dn`, `pct`). */
export function checklistProgress(s: ChecklistState) {
  const list = checklistItems(s)
  const done = list.filter((r) => s.done.includes(r.text)).length
  return { done, total: list.length, pct: list.length ? Math.round((done / list.length) * 100) : 0 }
}

/** A new object clears the ticks (`go: obj, done: {}`). */
export const pickObject = (s: ChecklistState, obj: ChecklistObject): ChecklistState => ({
  ...s,
  obj,
  done: [],
})

export const toggleSystem = (s: ChecklistState, key: ServiceKey): ChecklistState => ({
  ...s,
  sys: s.sys.includes(key) ? s.sys.filter((k) => k !== key) : [...s.sys, key],
})

export const toggleItem = (s: ChecklistState, text: string): ChecklistState => ({
  ...s,
  done: s.done.includes(text) ? s.done.filter((t) => t !== text) : [...s.done, text],
})

/** Polish plural of „rzecz” (`plw(n, 'rzecz', 'rzeczy', 'rzeczy')`). */
export function plural(n: number, one: string, few: string, many: string) {
  const d = n % 10
  const h = n % 100
  if (n === 1) return one
  return d >= 2 && d <= 4 && !(h >= 12 && h <= 14) ? few : many
}

const OBJECTS = A.checklist.objects.map((o) => o.key)
const SYSTEMS = A.checklist.systems.map((s) => s.key)

/** A stored checklist (browser storage) back to a state; anything odd → the start. */
export function parseChecklist(raw: string | null): ChecklistState {
  if (!raw) return INITIAL_CHECKLIST
  try {
    const v = JSON.parse(raw) as Partial<Record<keyof ChecklistState, unknown>>
    const obj = OBJECTS.find((o) => o === v.obj)
    if (!obj || !Array.isArray(v.sys) || !Array.isArray(v.done)) return INITIAL_CHECKLIST
    const sys = SYSTEMS.filter((k) => (v.sys as unknown[]).includes(k))
    const texts = new Set(A.checklist.items.map((r) => r.text))
    const done = (v.done as unknown[]).filter(
      (t): t is string => typeof t === 'string' && texts.has(t),
    )
    return { obj, sys, done }
  } catch {
    return INITIAL_CHECKLIST
  }
}

// ── „Nowe rozwiązania” (`nw`) ───────────────────────────────────────────────────────────

export type NewsState = {
  filter: NewsFilter
  /** Chosen card id; `null` = the first card of the filter (`nsel: -1`). */
  selected: number | null
}

type Card = { id: number; category: string; featured?: boolean }

/** The start: all cards, the featured one chosen (else the first). */
export const initialNews = (cards: readonly Card[]): NewsState => ({
  filter: 'all',
  selected: cards.find((c) => c.featured)?.id ?? null,
})

/** Cards of the filter (`nwL`). */
export const newsList = <T extends Card>(cards: readonly T[], filter: NewsFilter) =>
  cards.filter((c) => filter === 'all' || c.category === filter)

/** The chosen card: the selected one if it is in the filter, else the filter's first (`sel`). */
export function newsCurrent<T extends Card>(cards: readonly T[], s: NewsState): T | undefined {
  const list = newsList(cards, s.filter)
  return list.find((c) => c.id === s.selected) ?? list[0] ?? cards[0]
}

/** Counts of the filter buttons (`f[].c`): all cards, or of the category. */
export const newsCount = (cards: readonly Card[], filter: NewsFilter) =>
  newsList(cards, filter).length

/** A filter button chooses the filter's first card (`nsel: -1`). */
export const pickFilter = (s: NewsState, filter: NewsFilter): NewsState => ({
  filter,
  selected: null,
})

/** Previous / next within the filter, round (`nstep`). */
export function stepNews(cards: readonly Card[], s: NewsState, d: 1 | -1): NewsState {
  const list = newsList(cards, s.filter)
  const cur = newsCurrent(cards, s)
  const i = list.findIndex((c) => c.id === cur?.id)
  const next = list[(i + d + list.length) % list.length]
  return { ...s, selected: next?.id ?? s.selected }
}

/** „x / n” of the chosen card in the filter (`pos`). */
export function newsPosition(cards: readonly Card[], s: NewsState) {
  const list = newsList(cards, s.filter)
  const cur = newsCurrent(cards, s)
  return `${list.findIndex((c) => c.id === cur?.id) + 1} / ${list.length}`
}

/** Training and offers are marked hot (`tyCls`). */
export const hotType = (type: string) => type === 'Szkolenie' || type === 'Oferta'
