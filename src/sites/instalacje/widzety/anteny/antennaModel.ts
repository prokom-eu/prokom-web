/**
 * The aiming simulator of the Anteny hero (`zrodlo/pages/Anteny.js → page()` and `mountPage()`),
 * as pure functions: signal from the angles, the scene's geometry and one autoplay step.
 */

export type Mode = 'sat' | 'dvb'

export type AimState = { mode: Mode; az: number; el: number; mast: boolean }

/** Initial state of the prototype (`initState()`): no signal yet. */
export const INITIAL_AIM: AimState = { mode: 'sat', az: 174, el: 25, mast: false }

/** Hot Bird 13°E seen from Podhale; the DVB-T2 transmitter of the example. */
export const TARGET = { sat: { az: 189, el: 33 }, dvb: { az: 230 } } as const

/** Mode buttons set these angles (and lower the mast). */
export const MODE_START: Record<Mode, AimState> = {
  sat: { mode: 'sat', az: 175, el: 26, mast: false },
  dvb: { mode: 'dvb', az: 205, el: 0, mast: false },
}

/** „Ustaw jak instalator”. */
export function installerAim(state: AimState): AimState {
  return state.mode === 'sat'
    ? { ...state, az: TARGET.sat.az, el: TARGET.sat.el }
    : { ...state, az: TARGET.dvb.az, mast: true }
}

/** Azimuth step of the stepper: a satellite dish needs single degrees. */
export const azimuthStep = (mode: Mode) => (mode === 'sat' ? 1 : 5)

export type Signal = {
  /** Quality 0–1 (a Gaussian around the target angles). */
  q: number
  /** Meter values in %. */
  level: number
  quality: number
  lock: boolean
  beam: 'ok' | 'mid' | 'off'
}

export function signal({ mode, az, el, mast }: AimState): Signal {
  let q: number
  if (mode === 'sat') {
    const e = Math.hypot(az - TARGET.sat.az, el - TARGET.sat.el)
    q = Math.exp(-(e * e) / (2 * 2.6 * 2.6))
  } else {
    const e = Math.abs(az - TARGET.dvb.az)
    q = Math.exp(-(e * e) / (2 * 14 * 14)) * (mast ? 1 : 0.42)
  }
  const lock = q >= 0.7
  return {
    q,
    level: Math.round(22 + 74 * Math.pow(q, 0.6)),
    quality: Math.round(q * 100),
    lock,
    beam: lock ? 'ok' : q > 0.15 ? 'mid' : 'off',
  }
}

export type NoteKey = 'satLock' | 'satNear' | 'satNone' | 'dvbBlocked' | 'dvbLock' | 'dvbWeak'

/** Which explanation the note under the meter shows. */
export function noteKey(state: AimState, { q, lock }: Signal): NoteKey {
  if (state.mode === 'sat') return lock ? 'satLock' : q > 0.15 ? 'satNear' : 'satNone'
  if (!state.mast && Math.abs(state.az - TARGET.dvb.az) < 8) return 'dvbBlocked'
  return lock ? 'dvbLock' : 'dvbWeak'
}

const R = Math.PI / 180
const fix = (n: number) => n.toFixed(1)

/** Positions in the 640×330 scene (the prototype's `an.*` coordinates). */
export function scene({ mode, az, el, mast }: AimState) {
  const sat = mode === 'sat'
  const mastH = sat ? 34 : mast ? 78 : 34
  const ox = 470
  const oy = 172 - mastH
  let tx: number, ty: number, bx: number, by: number
  let yagi = ''
  if (sat) {
    const tEl = TARGET.sat.el
    tx = ox - 200 * Math.cos(tEl * R)
    ty = oy - 200 * Math.sin(tEl * R)
    bx = ox - 190 * Math.cos(el * R)
    by = oy - 190 * Math.sin(el * R)
  } else {
    tx = 70
    ty = 218
    const base = Math.atan2(ty - oy, tx - ox)
    const off = (az - TARGET.dvb.az) * R * 0.8
    bx = ox + 260 * Math.cos(base + off)
    by = oy + 260 * Math.sin(base + off)
    yagi = `translate(${ox} ${oy}) rotate(${fix((base + off) / R)})`
  }
  const compass = (angle: number, r: number) => ({
    x: fix(r * Math.sin(angle * R)),
    y: fix(-r * Math.cos(angle * R)),
  })
  return {
    ox,
    oy,
    target: { x: fix(tx), y: fix(ty) },
    beam: { x: fix(bx), y: fix(by) },
    mast: { x: ox - 2.5, y: oy, h: 176 - oy },
    dish: `translate(${ox} ${oy}) rotate(${el - 180})`,
    satellite: `translate(${fix(tx)} ${fix(ty)})`,
    yagi,
    compassTarget: compass(sat ? TARGET.sat.az : TARGET.dvb.az, 38),
    needle: compass(az, 34),
  }
}

/** Autoplay of the hero: the prototype's timer every 650 ms until the visitor touches it. */
export type Autoplay = AimState & { hold: number }

export function autoplayStep(s: Autoplay): Autoplay {
  const t = s.mode === 'sat' ? TARGET.sat : { az: TARGET.dvb.az, el: 0 }
  const daz = t.az - s.az
  const del = t.el - s.el
  if (Math.abs(daz) > 0 || (s.mode === 'sat' && Math.abs(del) > 0)) {
    return {
      ...s,
      az: s.az + Math.sign(daz) * Math.min(3, Math.abs(daz)),
      el: s.mode === 'sat' ? s.el + Math.sign(del) * Math.min(2, Math.abs(del)) : s.el,
    }
  }
  if (s.mode === 'dvb' && !s.mast) {
    return s.hold + 1 > 3 ? { ...s, hold: 0, mast: true } : { ...s, hold: s.hold + 1 }
  }
  if (s.hold + 1 > 6) {
    return s.mode === 'sat'
      ? { mode: 'dvb', az: 200, el: 0, mast: false, hold: 0 }
      : { mode: 'sat', az: 172, el: 24, mast: false, hold: 0 }
  }
  return { ...s, hold: s.hold + 1 }
}
