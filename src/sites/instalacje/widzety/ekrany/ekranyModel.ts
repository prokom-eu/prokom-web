import { ekrany, type ScreenKey } from '../../dane/ekrany'

/*
 * Logic of the Ekrany widgets, ported 1:1 from `zrodlo/pages/Multimedia.js` (`page()`,
 * `mountPage()`) as pure functions; `ekranyModel.test.ts` runs the original and compares the
 * results.
 */

const TV = ekrany.screens

// ── Screens in the hero (`tv`) ───────────────────────────────────────────────────────────

export const SCREEN_KEYS = Object.keys(TV.items) as ScreenKey[]
export const AUTOPLAY_MS = 2800

export type ScreenState = { tab: ScreenKey; slide: number }
export const INITIAL_SCREEN: ScreenState = { tab: 'rec', slide: 0 }

const pad = (n: number) => String(n).padStart(2, '0')

/** What the screen shows; `tick` drives the minutes of the clock on the reception slide. */
export function screenView({ tab, slide }: ScreenState, tick: number) {
  const t = TV.items[tab]
  const cur = t.schedule[Math.min(slide, t.schedule.length - 1)]!
  return {
    format: t.portrait ? TV.portrait : TV.landscape,
    portrait: t.portrait,
    slide: t.slides[slide]!,
    clock: `${pad(cur[0] + 1)}:${pad((tick * 7) % 60)}`,
    dots: [0, 1, 2].map((i) => i === slide),
    schedule: t.schedule.map((p) => ({
      name: p[2],
      left: `${((p[0] / 24) * 100).toFixed(1)}%`,
      width: `${(((p[1] - p[0]) / 24) * 100 - 0.6).toFixed(1)}%`,
      on: p === cur,
    })),
    now: `${(((cur[0] + 1) / 24) * 100).toFixed(1)}%`,
    note: t.note,
  }
}

/**
 * Tick `n` (1, 2, …) of the autoplay: the slides go round all the time; after the third slide,
 * every third tick, the next place — until the first touch.
 */
export function autoplayStep(s: ScreenState, n: number, touched: boolean): ScreenState {
  const slide = (s.slide + 1) % 3
  if (!touched && slide === 0 && n % 3 === 0) {
    return { tab: SCREEN_KEYS[(SCREEN_KEYS.indexOf(s.tab) + 1) % SCREEN_KEYS.length]!, slide: 0 }
  }
  return { ...s, slide }
}

// ── Demo: two salons (`sy`) ──────────────────────────────────────────────────────────────

const SY = ekrany.sync

export type SyncState = {
  prices: readonly number[]
  /** Number of changes sent (0 = none yet). */
  version: number
  /** Message of the last change, without its time. */
  message: string
  /** Row highlighted by the last change (−1 = none). */
  hot: number
}
export const INITIAL_SYNC: SyncState = { prices: SY.prices, version: 0, message: '', hot: -1 }

const send = (s: SyncState, prices: readonly number[], message: string, hot: number) => ({
  prices,
  version: s.version + 1,
  message,
  hot,
})

export function lowerPhone(s: SyncState): SyncState {
  const p = Math.max(999, s.prices[0]! - 100)
  return send(s, [p, ...s.prices.slice(1)], `${SY.phoneChange} ${p} zł`, 0)
}

export function togglePromo(s: SyncState): SyncState {
  const p = s.prices[3] === 349 ? 279 : 349
  return send(s, [...s.prices.slice(0, 3), p], p === 279 ? SY.promoOn : SY.promoOff, 3)
}

export const resetPrices = (s: SyncState): SyncState => send(s, SY.prices, SY.resetDone, -1)

/** Log line after a change; `time` = HH:MM:SS of the click. */
export const syncLog = (s: SyncState, time: string) =>
  s.version ? `${SY.sent} ${time} · ${s.message} · ${SY.updated}` : SY.log

export function syncRows(s: SyncState) {
  return SY.products.map((name, i) => ({
    name,
    price: `${s.prices[i]!.toLocaleString('pl-PL')} zł`,
    cls:
      'synr' +
      (s.version && s.hot === i ? ' hot' : '') +
      (i === 3 && s.prices[3] === 279 ? ' promo' : ''),
  }))
}

// ── Brightness (`js`) ────────────────────────────────────────────────────────────────────

const JS = ekrany.brightness
const MAX_NITS = 3500

/** A place for the screen; `regular` = show a plain 350-nit screen there instead. */
export function brightnessView(place: number, regular: boolean) {
  const J = JS.places[place]!
  const wash = regular ? Math.max(0, Math.min(1, (J.nits - 350) / 2500)) : 0
  return {
    scene: `p${place}`,
    range: J.range,
    cls: J.cls,
    text: J.text,
    bar: `${Math.min(100, (J.nits / MAX_NITS) * 100).toFixed(0)}%`,
    marks: JS.marks.map((m) => ({
      label: String(m),
      left: `${((m / MAX_NITS) * 100).toFixed(0)}%`,
    })),
    screenOpacity: (1 - wash * 0.85).toFixed(2),
    screenContrast: (1 - wash * 0.7).toFixed(2),
    toggle: regular ? JS.showPicked : JS.showRegular,
  }
}

// ── LED pixel pitch (`ld`) ───────────────────────────────────────────────────────────────

/** Slider in tenths of a millimetre (9–100 = 0.9–10 mm). */
export const INITIAL_PITCH = 25

const comma = (n: number) => n.toFixed(1).replace('.', ',')

/** Viewing distance for a pixel pitch: minimum ~1 m per mm, comfortable ~2.4 m per mm. */
export function ledView(pitch: number) {
  const lp = pitch / 10
  const z1 = Math.min(100, (lp / 25) * 100)
  return {
    pitch: comma(lp),
    min: comma(lp),
    comfort: comma(lp * 2.4),
    closeWidth: `${z1.toFixed(0)}%`,
    comfortLeft: `${z1.toFixed(0)}%`,
    comfortWidth: `${Math.max(0, Math.min(100, ((lp * 2.4) / 25) * 100) - z1).toFixed(0)}%`,
  }
}
