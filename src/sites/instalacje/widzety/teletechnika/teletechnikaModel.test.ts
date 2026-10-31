import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { parseInquiryInput } from '@/lib/inquiry/schema'

import { type TeleLayer, teletechnika } from '../../dane/teletechnika'
import { TT_SCENE } from './scena'
import {
  autoplayStep,
  buildingNote,
  INITIAL_BUILDING,
  INITIAL_QUOTE,
  pickElement,
  pickStep,
  quoteBody,
  quoteErrors,
  quoteErrorText,
  phoneOk,
  QUOTE_LIMITS,
  quoteSummary,
  sceneClass,
  sceneHtml,
  toggleLayer,
  unitsValue,
} from './teletechnikaModel'

// The reference: the prototype's own class (`zrodlo/pages/Teletechnika.js`, v4.2), run with a
// `setState` that merges, so clicks and the autoplay run in the original too.
const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../../docs/design/prokominstalacje/zrodlo/pages/Teletechnika.js',
      import.meta.url,
    ),
  ),
  'utf8',
)
type Ref = {
  tt: {
    cls: string
    nK: string
    nCls: string
    nT: string
    nD: string
    lay: { pick: () => void }[]
    steps: { pick: () => void; cls: string }[]
    nums: { pick: () => void }[]
    hl: Record<string, string>
    mk: Record<string, { cls: string }>
  }
  rfq: { sTyp: string; sZak: string; sLok: string; err: string; send: () => void }
}
type Proto = {
  state: Record<string, unknown>
  initState(): Record<string, unknown>
  mountPage(): void
  page(P: unknown, c: unknown): Ref
  tick?: () => void
}
const Prototype = new Function(
  `return class { ${source}
    sub(c, o) { return o }
    setState(o) { Object.assign(this.state, o) }
    every(ms, fn) { this.tick = fn.bind(this) } }`,
)() as new () => Proto
const P = new Proxy({}, { get: (_, key) => String(key) })

function fresh(state: Record<string, unknown> = {}): Proto {
  const proto = new Prototype()
  proto.state = { ...proto.initState(), tick: 0, ...state }
  return proto
}

const LAYERS: TeleLayer[] = ['fib', 'lan', 'rtv', 'dom']

describe('building cross-section', () => {
  it('clicks: layers, stages and elements as the prototype', () => {
    const proto = fresh()
    let s = INITIAL_BUILDING
    const check = () => {
      const tt = proto.page(P, {}).tt
      const n = buildingNote(s)
      expect(sceneClass(s)).toBe(tt.cls)
      expect([n.key, n.element ? 'ttnk el' : 'ttnk', n.title, n.text]).toEqual([
        tt.nK,
        tt.nCls,
        tt.nT,
        tt.nD,
      ])
    }
    check()
    const actions: (() => void)[] = [
      ...LAYERS.map((l, i) => () => {
        proto.page(P, {}).tt.lay[i]!.pick()
        s = toggleLayer(s, l)
      }),
      ...[0, 1, 5, 2].map((st) => () => {
        proto.page(P, {}).tt.steps[st]!.pick()
        s = pickStep(s, st)
      }),
      ...[0, 4, 4, 8].map((e) => () => {
        proto.page(P, {}).tt.nums[e]!.pick()
        s = pickElement(s, e)
      }),
      () => {
        proto.page(P, {}).tt.lay[1]!.pick()
        s = toggleLayer(s, 'lan')
      },
    ]
    for (const act of actions) {
      act()
      check()
    }
  })

  it('autoplay: 14 stages as the prototype', () => {
    const proto = fresh()
    proto.mountPage()
    for (let n = 0; n < 14; n++) {
      proto.tick!()
      expect(sceneClass(autoplayStep(INITIAL_BUILDING, n))).toBe(proto.page(P, {}).tt.cls)
    }
  })

  it.each([-1, 0, 4, 8])('scene classes of element %i as the prototype', (el) => {
    const tt = fresh({ el }).page(P, {}).tt
    const html = sceneHtml(TT_SCENE.html, el)
    for (let k = 1; k <= 9; k++) {
      expect(html).toContain(`class="${tt.hl[`k${k}`]}`)
      expect(html).toContain(`class="${tt.mk[`k${k}`]!.cls}"`)
    }
    expect(html).not.toMatch(/%tt\./)
  })
})

describe('quote form', () => {
  it.each([
    [{}],
    [{ rName: 'Firma', rTel: '600 000 000', rOk: true }],
    [{ rName: 'Firma', rMail: 'biuro@firma.pl' }],
    [{ rTel: '12', rMail: 'zły', rOk: true }],
    [{ rTyp: 3, rZak: [], rLok: '120' }],
  ])('summary and errors for %o as the prototype', (st) => {
    const proto = fresh(st as Record<string, unknown>)
    proto.page(P, {}).rfq.send()
    const ref = proto.page(P, {}).rfq
    const s = {
      ...INITIAL_QUOTE,
      type: (st as { rTyp?: number }).rTyp ?? 0,
      scopes: ((st as { rZak?: string[] }).rZak ?? INITIAL_QUOTE.scopes) as never,
      units: (st as { rLok?: string }).rLok ?? '',
      name: (st as { rName?: string }).rName ?? '',
      phone: (st as { rTel?: string }).rTel ?? '',
      email: (st as { rMail?: string }).rMail ?? '',
      consent: (st as { rOk?: boolean }).rOk ?? false,
    }
    const sum = quoteSummary(s)
    expect([sum.type, sum.scope, sum.units]).toEqual([ref.sTyp, ref.sZak, ref.sLok])
    expect(quoteErrorText(quoteErrors(s))).toBe(ref.err)
  })

  it('accepts a phone only in the server format', () => {
    expect(phoneOk('600 123 456')).toBe(true)
    expect(phoneOk('+48 (12) 600-12-34')).toBe(true)
    expect(phoneOk('600.123.456')).toBe(false)
    expect(phoneOk('600 123 456 wew. 12')).toBe(false)
    expect(phoneOk('600 12')).toBe(false)
  })

  it('keeps only digits in the number of units', () => {
    expect(unitsValue('12a3 45')).toBe('1234')
  })

  it('sends a contact inquiry the schema accepts', () => {
    const body = quoteBody(
      {
        ...INITIAL_QUOTE,
        units: '24',
        place: 'Nowy Targ',
        stage: 'stan surowy',
        term: 'II kwartał 2027',
        name: 'Budimex Sp. z o.o.',
        phone: '600 000 000',
        email: 'zły',
        consent: true,
      },
      { href: 'https://instalacje.localhost/teletechnika', formToken: 't', website: '' },
    )
    expect(body).toMatchObject({
      type: 'contact',
      category: teletechnika.quote.category,
      topics: ['Okablowanie LAN', 'Światłowód', 'Domofony'],
      city: 'Nowy Targ',
      deadline: 'II kwartał 2027',
      phone: '600 000 000',
    })
    expect(body).not.toHaveProperty('email')
    expect(body.message).toContain('Liczba lokali: 24')
    expect(parseInquiryInput(body, 'instalacje').success).toBe(true)
  })

  it('the longest values the form lets through still pass the schema', () => {
    const body = quoteBody(
      {
        ...INITIAL_QUOTE,
        place: 'x'.repeat(QUOTE_LIMITS.place),
        term: 'x'.repeat(QUOTE_LIMITS.term),
        stage: 'x'.repeat(QUOTE_LIMITS.stage),
        name: 'x'.repeat(QUOTE_LIMITS.name),
        phone: `+48 ${'1'.repeat(QUOTE_LIMITS.phone - 4)}`,
        consent: true,
      },
      { href: 'https://instalacje.localhost/teletechnika', formToken: 't', website: '' },
    )
    expect(parseInquiryInput(body, 'instalacje').success).toBe(true)
  })
})
