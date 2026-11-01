import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { architekci as A } from '../../dane/architekci'
import {
  checklistItems,
  checklistPhases,
  checklistProgress,
  type ChecklistState,
  hotType,
  INITIAL_CHECKLIST,
  initialNews,
  newsCount,
  newsCurrent,
  newsList,
  newsPosition,
  parseChecklist,
  pickFilter,
  pickObject,
  plural,
  stepNews,
  toggleItem,
  toggleSystem,
} from './architektModel'

// The reference: the prototype's page class (`zrodlo/pages/Architekci.js`) with the shared
// methods it calls (`arHotspots`, `arScene`, `arSpecs`, `plw` from `common.js`), `setState`
// merging into the state.
const read = (path: string) =>
  readFileSync(
    fileURLToPath(
      new URL(`../../../../../docs/design/prokominstalacje/zrodlo/${path}`, import.meta.url),
    ),
    'utf8',
  )
const common = read('common.js')
const slice = (from: string, to: string) => common.slice(common.indexOf(from), common.indexOf(to))
const shared =
  slice('  arHotspots() {', '  arSpecs() {') +
  common.slice(common.indexOf('  arSpecs() {')).split('\n  }\n')[0] +
  '\n  }\n' +
  common.slice(common.indexOf('  plw('), common.indexOf('  norm('))

type Btn = { go: () => void; on: string; n: string }
type Ref = {
  ar: {
    ck: {
      objs: Btn[]
      sys: Btn[]
      ph: { n: string; items: (Btn & { t: string })[] }[]
      n: number
      nW: string
      dn: number
      pct: string
      empty: boolean
    }
    nw: {
      f: (Btn & { c: string })[]
      items: { t: string; go: () => void; on: string; tyCls: string }[]
      cur: { t: string; pos: string }
      prev: () => void
      next: () => void
    }
  }
}
type Proto = {
  state: Record<string, unknown>
  initState(): Record<string, unknown>
  page(P: unknown, c: unknown): Ref
}
const Proto = new Function(
  `return class { ${read('pages/Architekci.js')}
    ${shared}
    setState(o) { Object.assign(this.state, o) }
    faqList() { return [] }
    every() {} }`,
)() as new () => Proto
const P = new Proxy({}, { get: (_, key) => String(key) })
const HU = new Proxy({}, { get: (_, key) => `#${String(key)}` })
const SV = ['smart', 'snd', 'kam', 'alarm', 'kd', 'wifi', 'tel', 'ant', 'scr', 'ev'].map((k) => ({
  k,
  n: k,
  s: k,
  ic: k,
  href: k,
}))
function prototype() {
  const proto = new Proto()
  proto.state = proto.initState()
  return { proto, render: () => proto.page(P, { HU, P, SV }).ar }
}

const ours = (s: ChecklistState) => {
  const progress = checklistProgress(s)
  return {
    ph: checklistPhases(s).map((p) => ({ n: p.name, items: p.items.map((i) => i.text) })),
    n: progress.total,
    dn: progress.done,
    pct: `width:${progress.pct}%`,
    empty: checklistItems(s).length === 0,
  }
}
const theirs = (ck: Ref['ar']['ck']) => ({
  ph: ck.ph.map((p) => ({ n: p.n, items: p.items.map((i) => i.t) })),
  n: ck.n,
  dn: ck.dn,
  pct: ck.pct,
  empty: ck.empty,
})

describe('checklist — the same as the prototype', () => {
  it('starts on a house with the default systems: 20 items', () => {
    expect(checklistItems(INITIAL_CHECKLIST)).toHaveLength(20)
    expect(ours(INITIAL_CHECKLIST)).toEqual(theirs(prototype().render().ck))
  })

  it('objects, systems and ticks follow the same steps', () => {
    const { render } = prototype()
    let s = INITIAL_CHECKLIST
    const check = () => expect(ours(s)).toEqual(theirs(render().ck))
    const tick = (phase: number, item: number) => {
      const t = render().ck.ph[phase]?.items[item]
      t?.go()
      if (t) s = toggleItem(s, t.t)
    }
    tick(0, 0)
    tick(1, 2)
    check()
    render().ck.sys[0]?.go() // wifi off
    s = toggleSystem(s, 'wifi')
    check()
    render().ck.sys[2]?.go() // alarm on
    s = toggleSystem(s, 'alarm')
    check()
    // Another object clears the ticks.
    render().ck.objs[4]?.go() // wiel
    s = pickObject(s, 'wiel')
    check()
    tick(0, 0)
    check()
    for (const k of [0, 1, 2, 3, 4, 5, 6, 7, 8]) render().ck.sys[k]?.go()
    for (const sys of A.checklist.systems) s = toggleSystem(s, sys.key)
    check()
  })

  it('says „rzecz / rzeczy” like the prototype', () => {
    expect([1, 2, 5, 12, 22, 31].map((n) => plural(n, 'rzecz', 'rzeczy', 'rzeczy'))).toEqual([
      'rzecz',
      'rzeczy',
      'rzeczy',
      'rzeczy',
      'rzeczy',
      'rzeczy',
    ])
    expect(plural(3, 'a', 'b', 'c')).toBe('b')
    expect(plural(13, 'a', 'b', 'c')).toBe('c')
    expect(plural(25, 'a', 'b', 'c')).toBe('c')
  })

  it('reads stored ticks safely', () => {
    expect(parseChecklist(null)).toEqual(INITIAL_CHECKLIST)
    expect(parseChecklist('{nope')).toEqual(INITIAL_CHECKLIST)
    expect(parseChecklist('{"obj":"zamek","sys":[],"done":[]}')).toEqual(INITIAL_CHECKLIST)
    const text = A.checklist.items[0]?.text ?? ''
    expect(
      parseChecklist(JSON.stringify({ obj: 'apt', sys: ['wifi', 'x'], done: [text, 'obce', 7] })),
    ).toEqual({ obj: 'apt', sys: ['wifi'], done: [text] })
  })
})

describe('„Nowe rozwiązania” — the same as the prototype', () => {
  // The prototype's 20 cards (`NW`), all published, in package order: ids 1…20.
  const proto = prototype()
  const titles = proto.render().nw.items.map((i) => i.t)
  const cards = titles.map((title, i) => ({
    id: i + 1,
    title,
    category:
      [
        'snd',
        'snd',
        'snd',
        'snd',
        'snd',
        'scr',
        'scr',
        'scr',
        'scr',
        'smart',
        'smart',
        'wifi',
        'wifi',
        'kam',
        'kam',
        'kam',
        'kam',
        'ev',
        'sz',
        'sz',
      ][i] ?? '',
  }))

  it('has the same 20 cards as the package', () => {
    expect(titles).toHaveLength(20)
  })

  it('filters, counts, steps and positions the same', () => {
    const { render } = prototype()
    let s = initialNews(cards)
    const check = () => {
      const r = render().nw
      expect(newsList(cards, s.filter).map((c) => c.title)).toEqual(r.items.map((i) => i.t))
      expect(newsCurrent(cards, s)?.title).toBe(r.cur.t)
      expect(newsPosition(cards, s)).toBe(r.cur.pos)
      expect(A.newsFilters.map((f) => String(newsCount(cards, f.key)))).toEqual(r.f.map((f) => f.c))
    }
    check()
    render().nw.next()
    s = stepNews(cards, s, 1)
    check()
    render().nw.f[2]?.go() // scr
    s = pickFilter(s, 'scr')
    check()
    render().nw.prev()
    s = stepNews(cards, s, -1)
    check()
    render().nw.items[2]?.go()
    s = { ...s, selected: newsList(cards, 'scr')[2]?.id ?? null }
    check()
    render().nw.f[7]?.go() // sz
    s = pickFilter(s, 'sz')
    check()
    expect(render().nw.items.map((i) => i.tyCls)).toEqual(['arty hot', 'arty hot'])
    expect(hotType('Szkolenie') && hotType('Oferta') && !hotType('Nowość')).toBe(true)
  })

  it('starts on the featured card, else the first', () => {
    expect(initialNews(cards).selected).toBeNull()
    expect(newsCurrent(cards, initialNews(cards))?.id).toBe(1)
    const withFeatured = cards.map((c) => ({ ...c, featured: c.id === 10 }))
    expect(newsCurrent(withFeatured, initialNews(withFeatured))?.id).toBe(10)
  })
})
