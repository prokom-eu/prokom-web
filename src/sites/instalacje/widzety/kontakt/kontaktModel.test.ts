import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { norm } from '@/lib/instalacje/plan'
import { parseInquiryInput } from '@/lib/inquiry/schema'

import { contactBody, contactError, INITIAL_CONTACT, mapView } from './kontaktModel'

// The reference: the prototype's own class (`zrodlo/pages/Kontakt.js`, v4.2) with the base
// class's `norm()` and a `setState` that merges.
const source = readFileSync(
  fileURLToPath(
    new URL('../../../../../docs/design/prokominstalacje/zrodlo/pages/Kontakt.js', import.meta.url),
  ),
  'utf8',
)
type Kt = {
  zc: Record<'p' | 'r' | 'z', string>
  towns: {
    n: string
    x: number
    y: number
    r: number
    tx: number
    ty: number
    fc: string
    cls: string
  }[]
  pins: { tr: string }[]
  route: string
  zt: string
  zd: string
  errT: string
  send: () => void
}
type Proto = {
  state: Record<string, unknown>
  initState(): Record<string, unknown>
  page(P: unknown, c: unknown): { kt: Kt }
}
const Prototype = new Function(
  'norm',
  `return class { ${source}
    norm(s) { return norm(s) }
    setState(o) { Object.assign(this.state, o) } }`,
)(norm) as new () => Proto
const P = new Proxy({}, { get: (_, key) => String(key) })
const C = {
  K: {
    tel: 'T',
    telH: 'tel:',
    wa: 'W',
    waH: 'https://wa.me/',
    mail: 'M',
    mailH: 'mailto:',
    adrZ: 'Z',
  },
}

function kt(state: Record<string, unknown>): { proto: Proto; kt: Kt } {
  const proto = new Prototype()
  proto.state = { ...proto.initState(), ...state }
  return { proto, kt: proto.page(P, C).kt }
}

/** The prototype's zone text without its `[SZEF…]` notes (open questions, not on the page). */
const withoutNotes = (text: string) =>
  text
    .replace(/\s*\[SZEF[^\]]*\]/g, '')
    .replace(' Wizja lokalna zwykle w kilka dni.', '')
    .trim()

describe('contact map as the prototype', () => {
  it.each(['', 'Ra', 'Szczaw', 'zakopane', 'Chabówka', 'Kraków', 'Szaflary', 'Bukowina', 'Rabka'])(
    'query %j',
    (q) => {
      const ref = kt({ q }).kt
      const ours = mapView(q)
      expect(ours.zoneClass).toEqual(ref.zc)
      expect(ours.route).toBe(ref.route)
      expect(ours.pins).toEqual(ref.pins.map((p) => p.tr))
      expect(ours.title).toBe(ref.zt)
      expect(ours.text).toBe(withoutNotes(ref.zd))
      expect(ours.towns.map((t) => [t.name, t.x, t.y, t.r, t.tx, t.ty, t.side, t.cls])).toEqual(
        ref.towns.map((t) => [t.n, t.x, t.y, t.r, t.tx, t.ty, t.fc, t.cls]),
      )
    },
  )
})

describe('contact form', () => {
  const ready = { ...INITIAL_CONTACT, name: 'Anna', phone: '600 100 200', consent: true }

  it.each([
    [
      { fPh: '600 100', fCons: true },
      { phone: '600 100', consent: true },
    ],
    [{ fPh: '600 100 200' }, { phone: '600 100 200', consent: false }],
    [
      { fPh: '600 100 200', fCons: true },
      { phone: '600 100 200', consent: true },
    ],
  ])('errors as the prototype for %o (the name filled in)', (st, ours) => {
    const { proto } = kt(st)
    proto.page(P, C).kt.send()
    const expected = (proto.state.fErr as string) || null
    const error = contactError({ ...ready, ...ours })
    const texts = {
      phone: 'Podaj numer telefonu (9 cyfr), żebyśmy mogli oddzwonić.',
      consent: 'Zaznacz zgodę na kontakt w sprawie wiadomości.',
    }
    expect(error ? texts[error as keyof typeof texts] : null).toBe(expected)
  })

  it('asks for the name first (the inquiry needs it)', () => {
    expect(contactError({ ...ready, name: ' ' })).toBe('name')
  })

  it('sends a contact inquiry the server accepts, the topic opening the message', () => {
    const body = contactBody(
      { ...ready, topic: 1, message: '  Kamera nie nagrywa. ' },
      { href: 'https://instalacje.localhost/kontakt', formToken: 't', website: '' },
    )
    expect(body).toMatchObject({
      type: 'contact',
      category: 'Instalacje — kontakt',
      message: 'Sprawa: Awaria lub serwis\nKamera nie nagrywa.',
    })
    expect(parseInquiryInput(body, 'instalacje').success).toBe(true)
    const bare = contactBody(ready, { href: 'https://x.pl/', formToken: 't', website: '' })
    expect(bare.message).toBe('Sprawa: Nowa instalacja')
  })
})
