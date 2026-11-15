import { type AccessTab, dostep, type ScheduleBar } from '../../dane/dostep'

/*
 * Logic of the Kontrola dostępu widgets, ported 1:1 from `zrodlo/pages/Dostep.js` (`page()`,
 * `enter()`, `mountPage()`) as pure functions; `dostepModel.test.ts` runs the original and
 * compares the results.
 */

const L = dostep.lock

// ── Keypad lock (`kd`) ───────────────────────────────────────────────────────────────────

export type Entry = { ok: boolean; message: string }
export type LockState = {
  tab: AccessTab
  code: string
  /** Result of the last OK: '' (none), 'ok', 'bad'. */
  res: '' | 'ok' | 'bad'
  /** Last two results, newest first (kept across tabs, as in the prototype). */
  hist: Entry[]
}

export const INITIAL_LOCK: LockState = { tab: 'apt', code: '', res: '', hist: [] }
export const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'] as const
export type Key = (typeof KEYS)[number]

/** OK: checks the code and writes the result to the history. */
export function enter(state: LockState): LockState {
  const ok = state.code === L.guestCode
  const message = ok
    ? L.messages.ok
    : state.code === L.expiredCode
      ? L.messages.expired
      : L.messages.bad
  return { ...state, res: ok ? 'ok' : 'bad', hist: [{ ok, message }, ...state.hist].slice(0, 2) }
}

/** A key of the keypad; after a result the next digit starts a new code. */
export function press(state: LockState, key: Key): LockState {
  if (key === 'C') return { ...state, code: '', res: '' }
  if (key === 'OK') return enter(state)
  return { ...state, code: (state.res ? '' : state.code + key).slice(0, 6) || key, res: '' }
}

/** Another object: a fresh keypad, the history stays. */
export function pickTab(state: LockState, tab: AccessTab): LockState {
  return { ...state, tab, code: '', res: '' }
}

/** Autoplay (`mountPage`, every 0.8 s until the first touch): a good code, then an expired one. */
const SEQ = ['2', '4', '6', '8', 'E', 'W', 'W', 'R', '1', '3', '5', '7', 'E', 'W', 'W', 'R']
export const AUTOPLAY_MS = 800

export function autoplayStep(state: LockState, step: number): LockState {
  const k = SEQ[step % SEQ.length]!
  if (k === 'W') return state
  if (k === 'R') return { ...state, code: '', res: '' }
  if (k === 'E') return enter(state)
  return { ...state, code: (state.code + k).slice(0, 6), res: '' }
}

export type LockView = {
  display: string
  status: string
  /** Door drawing: '' | 'open' | 'bad'. */
  door: '' | 'open' | 'bad'
  log: { bad: boolean; icon: string; when: string; text: string }[]
}

export function lockView(state: LockState): LockView {
  const t = L.tabs[state.tab]
  const status =
    state.res === 'ok'
      ? L.status.ok
      : state.res === 'bad'
        ? state.code === L.expiredCode
          ? L.status.expired
          : L.status.bad
        : state.code
          ? L.status.typed
          : L.status.idle
  const fresh = state.hist.map((h) => ({
    bad: !h.ok,
    icon: h.ok ? 'check' : 'x',
    when: L.now,
    text: `${t.door.toLowerCase()} · ${h.message}`,
  }))
  const fixed = t.log.map((l) => ({
    bad: l.icon === 'x',
    icon: l.icon,
    when: l.when,
    text: l.text,
  }))
  return {
    display: state.code ? state.code.replace(/./g, '•') : L.empty,
    status,
    door: state.res === 'ok' ? 'open' : state.res === 'bad' ? 'bad' : '',
    log: [...fresh, ...fixed].slice(0, 3),
  }
}

/** Position of a bar in the week (% of seven days, at least 1.2% wide). */
export function barPosition(bar: ScheduleBar): { left: string; width: string } {
  const l = ((bar.from[0] + bar.from[1] / 24) / 7) * 100
  const r = ((bar.to[0] + bar.to[1] / 24) / 7) * 100
  return { left: `${l.toFixed(2)}%`, width: `${Math.max(1.2, r - l).toFixed(2)}%` }
}

// ── Locks without power (`lk`) ───────────────────────────────────────────────────────────

/** A lock opens without power only if it fails open (magnet, reversed strike). */
export function lockOpen(power: boolean, failOpen: boolean): boolean {
  return !power && failOpen
}
