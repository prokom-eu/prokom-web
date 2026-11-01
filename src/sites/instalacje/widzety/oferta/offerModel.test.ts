import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import oferta from '../../../../../seed/prokominstalacje/oferta-76.json'
import { INITIAL_OFFER, offerNorm, offerView, type OfferArea, type OfferState } from './offerModel'

// The reference: the prototype's own class (`zrodlo/pages/Oferta.js`, v4.2) with a `setState`
// that merges, fed with the same data (`offer()` and `c.SV` from `oferta-76.json`).
const source = readFileSync(
  fileURLToPath(
    new URL('../../../../../docs/design/prokominstalacje/zrodlo/pages/Oferta.js', import.meta.url),
  ),
  'utf8',
)
// One salon (boss 01.11.2026): the prototype's `AFIX` of the screens says „salonach”.
const oneSalon = source.replace('Wdrażamy to w naszych salonach.', 'Wdrażamy to w naszym salonie.')

const areas: OfferArea[] = oferta.obszary.map((a) => ({
  key: a.usluga,
  name: a.nazwaUslugi,
  icon: null,
  href: `/${a.usluga}`,
  family: a.rodzina,
  description: a.opis,
  brands: a.marki,
  solutions: a.rozwiazania.map((s) => ({
    name: s.nazwa,
    description: s.opis,
    categories: s.obiekty as OfferArea['solutions'][number]['categories'],
  })),
}))

type ProtoArea = {
  id: string
  n: string
  d: string
  b: string[]
  items: { n: string; d: string; t: string[] }[]
  nItems: number
  more: boolean
  less: boolean
  cls: string
}
type Proto = {
  state: Record<string, unknown>
  initState(): Record<string, unknown>
  page(P: unknown, c: unknown): { of: Record<string, unknown> & { areas: ProtoArea[] } }
}
const Prototype = new Function(
  'OFFER',
  `return class { ${oneSalon}
    offer() { return OFFER }
    setState(o) { Object.assign(this.state, o) } }`,
)(
  oferta.obszary.map((a) => ({
    k: a.usluga,
    fam: a.rodzina,
    d: a.opis,
    b: a.marki,
    items: a.rozwiazania.map((s) => [s.nazwa, s.opis, s.obiekty.join(' ')]),
  })),
) as new () => Proto
const P = new Proxy({}, { get: (_, key) => String(key) })
const C = {
  SV: oferta.obszary.map((a) => ({ k: a.usluga, n: a.nazwaUslugi, ic: 'i', href: `/${a.usluga}` })),
}

function proto(state: Partial<OfferState>) {
  const p = new Prototype()
  p.state = { ...p.initState(), ...state }
  return p.page(P, C).of
}

describe('offer list as the prototype', () => {
  it.each<Partial<OfferState>>([
    {},
    { q: 'kamera' },
    { q: 'Wi-Fi dla gości' },
    { q: 'kościół' },
    { q: 'menu board' },
    { q: 'ladowarka' },
    { q: 'zamki' },
    { q: 'xyz nic' },
    { o: 'pens' },
    { o: 'inst', q: 'muzyka' },
    { open: { kam: true, wifi: true } },
  ])('state %o', (state) => {
    const ref = proto(state)
    const ours = offerView(areas, { ...INITIAL_OFFER, ...state })
    expect(ours.total).toBe(ref.nAll)
    expect(ours.shown).toBe(ref.nShow)
    expect(ours.filtered).toBe(ref.filtered)
    expect(ours.empty).toBe(ref.empty)
    expect(
      ours.areas.map((a) => [
        a.id,
        a.name,
        a.description,
        a.brands,
        a.count,
        a.more,
        a.less,
        a.hidden,
      ]),
    ).toEqual(
      ref.areas.map((a) => [a.id, a.n, a.d, a.b, a.nItems, a.more, a.less, a.cls.includes('hide')]),
    )
    expect(
      ours.areas.map((a) =>
        a.items
          .filter((i) => !i.hidden)
          .map(({ name, description, tags }) => ({ name, description, tags })),
      ),
    ).toEqual(
      ref.areas.map((a) => a.items.map((i) => ({ name: i.n, description: i.d, tags: i.t }))),
    )
  })
})

describe('the patched prototype', () => {
  it('has the one-salon text (the comparison would fail on the screens otherwise)', () => {
    expect(oneSalon).not.toBe(source)
  })
})

describe('offerNorm', () => {
  it('drops Polish letters, dashes and punctuation', () => {
    expect(offerNorm('Wi-Fi dla gości, Łódź!')).toBe('wifi dla gosci lodz')
  })
})
