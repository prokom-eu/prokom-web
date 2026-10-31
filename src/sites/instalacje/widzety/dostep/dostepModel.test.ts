import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { type AccessTab, dostep } from '../../dane/dostep'
import {
  autoplayStep,
  barPosition,
  INITIAL_LOCK,
  type Key,
  KEYS,
  lockOpen,
  type LockState,
  lockView,
  pickTab,
  press,
} from './dostepModel'

// The reference: the prototype's own class (`zrodlo/pages/Dostep.js`, v4.2) with a `setState`
// that really merges, so key presses and the autoplay run in the original too.
const source = readFileSync(
  fileURLToPath(
    new URL('../../../../../docs/design/prokominstalacje/zrodlo/pages/Dostep.js', import.meta.url),
  ),
  'utf8',
)
type Ref = {
  kd: {
    disp: string
    dispS: string
    dcls: string
    keys: { press: () => void }[]
    tabs: { pick: () => void }[]
    rows: { n: string; bars: { t: string; st: string; cls: string }[] }[]
    log: { cls: string; ic: string; t: string; s: string }[]
  }
  lk: { items: { state: string; cls: string }[]; tPw: () => void }
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

function fresh(): Proto {
  const proto = new Prototype()
  proto.state = { ...proto.initState(), tick: 0 }
  return proto
}

function expectSame(proto: Proto, state: LockState) {
  const ref = proto.page(P, {}).kd
  const v = lockView(state)
  expect([v.display, v.status, v.door]).toEqual([ref.disp, ref.dispS, ref.dcls])
  expect(
    v.log.map((l) => ({ cls: l.bad ? 'kl bad' : 'kl', ic: l.icon, t: l.when, s: l.text })),
  ).toEqual(ref.log)
}

const TABS: AccessTab[] = ['apt', 'fir', 'wsp']

describe('keypad lock', () => {
  it.each([
    [['2', '4', '6', '8', 'OK']],
    [['1', '3', '5', '7', 'OK']],
    [['9', '9', 'OK', '2', '4', '6', '8', 'OK']],
    [['1', '2', '3', '4', '5', '6', '7', '8']],
    [['5', 'C', '2', '4', '6', '8', 'OK', '1', '3', '5', '7', 'OK', '0', 'OK']],
  ] as Key[][][])('presses %j as the prototype', (keys) => {
    const proto = fresh()
    let state = INITIAL_LOCK
    for (const key of keys) {
      proto.page(P, {}).kd.keys[KEYS.indexOf(key)]!.press()
      state = press(state, key)
      expectSame(proto, state)
    }
  })

  it.each(TABS.map((t, i) => [t, i] as const))('tab %s keeps the history', (tab, i) => {
    const proto = fresh()
    let state = INITIAL_LOCK
    for (const key of ['2', '4', '6', '8', 'OK'] as Key[]) {
      proto.page(P, {}).kd.keys[KEYS.indexOf(key)]!.press()
      state = press(state, key)
    }
    proto.page(P, {}).kd.tabs[i]!.pick()
    state = pickTab(state, tab)
    expectSame(proto, state)
    const ref = proto.page(P, {}).kd.rows
    expect(
      dostep.lock.tabs[tab].rows.map((r) => ({
        n: r.name,
        bars: r.bars.map((b) => {
          const p = barPosition(b)
          return {
            t: b.label,
            st: `left:${p.left};width:${p.width}`,
            cls: b.state ? `kbar ${b.state}` : 'kbar',
          }
        }),
      })),
    ).toEqual(ref)
  })

  it('autoplay: 32 steps as the prototype', () => {
    const proto = fresh()
    proto.mountPage()
    let state = INITIAL_LOCK
    for (let step = 0; step < 32; step++) {
      proto.tick!()
      state = autoplayStep(state, step)
      expectSame(proto, state)
    }
  })
})

describe('locks without power', () => {
  it.each([true, false])('power %s as the prototype', (power) => {
    const proto = fresh()
    if (!power) proto.page(P, {}).lk.tPw()
    const ref = proto.page(P, {}).lk.items
    expect(
      dostep.locks.items.map((l) => {
        const open = lockOpen(power, l.failOpen)
        return {
          state: open ? dostep.locks.open : dostep.locks.closed,
          cls: `lki${open ? ' open' : ''}${power ? ' pw' : ''}`,
        }
      }),
    ).toEqual(ref.map((r) => ({ state: r.state, cls: r.cls })))
  })
})
