import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { realizationsToImport } from '@/seed/instalacje/map'

import {
  INITIAL_REALIZATIONS,
  realizationArt,
  realizationsView,
  type RealizationItem,
  type RealizationsState,
} from './realizacjeModel'

// The reference: the prototype's own class (`zrodlo/pages/Realizacje.js`, v4.2) — its table `R`
// is the source of the seed's services and kinds, so both sides hold the same eleven realizations.
const source = readFileSync(
  fileURLToPath(
    new URL(
      '../../../../../docs/design/prokominstalacje/zrodlo/pages/Realizacje.js',
      import.meta.url,
    ),
  ),
  'utf8',
)
type Proto = {
  state: Record<string, unknown>
  initState(): Record<string, unknown>
  page(
    P: unknown,
    c: unknown,
  ): {
    rl: {
      fs: { n: string; c: number; on: string }[]
      fo: { n: string; on: string }[]
      list: { n: string; art: string; cls: string }[]
      empty: boolean
      moreOn: boolean
      moreT: string
    }
  }
}
const Prototype = new Function(
  `return class { ${source}
    setState(o) { Object.assign(this.state, o) } }`,
)() as new () => Proto
const P = new Proxy({}, { get: (_, key) => String(key) })

const items: RealizationItem[] = realizationsToImport().map((r) => ({
  id: r.legacyId,
  title: r.title,
  category: r.category ?? null,
  place: r.place ?? null,
  scope: r.scope ?? null,
  description: r.description ?? null,
  year: null,
  services: r.services ?? [],
  kind: r.kind ?? null,
}))

describe('realizations as the prototype', () => {
  it.each<Partial<RealizationsState>>([
    {},
    { more: true },
    { fs: 'snd' },
    { fs: 'scr', fo: 'gastro' },
    { fo: 'kosciol' },
    { fs: 'wifi', fo: 'dom' },
  ])('state %o', (state) => {
    const p = new Prototype()
    p.state = { ...p.initState(), ...state }
    const ref = p.page(P, {}).rl
    const ours = realizationsView(items, { ...INITIAL_REALIZATIONS, ...state })
    expect(ours.serviceFilters.map((f) => [f.label, f.count, f.on])).toEqual(
      ref.fs.map((f) => [f.n, f.c, f.on === 'true']),
    )
    expect(ours.kindFilters.map((f) => [f.label, f.on])).toEqual(
      ref.fo.map((f) => [f.n, f.on === 'true']),
    )
    expect(ours.list.map((r) => [r.title, r.hidden, realizationArt(r)])).toEqual(
      ref.list.map((r) => [r.n, r.cls.includes('xa-rlx'), r.art]),
    )
    expect([ours.empty, ours.moreOn, ours.moreLabel]).toEqual([ref.empty, ref.moreOn, ref.moreT])
  })
})
