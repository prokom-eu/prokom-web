import type { CamMode, SystemElementKey, SystemVersion } from '../../dane/monitoring'
import { SYSTEM_ELEMENT_KEYS } from '../../dane/monitoring'

/*
 * Logic of the Monitoring widgets, ported 1:1 from `zrodlo/pages/Monitoring.js` (`page()`) as
 * pure functions; `monitoringModel.test.ts` runs the original `page()` and compares the results.
 */

// ── Recorder preview (`nv`) ──────────────────────────────────────────────────────────────

export type NvrState = {
  mode: CamMode
  /** Enlarged camera, −1 = the grid of four. */
  sel: number
  ai: boolean
  mask: boolean
  deter: boolean
}

export const INITIAL_NVR: NvrState = { mode: 'col', sel: -1, ai: true, mask: true, deter: true }

/** Order of the autoplay (`mountPage`: every 4.2 s until the first touch, starting after `col`). */
export const AUTOPLAY_MODES: readonly CamMode[] = ['col', 'ir', 'day']
export const AUTOPLAY_MS = 4200
/** The prototype's global tick (`common.js`), which drives the recorder clock. */
export const TICK_MS = 1300

const pad = (n: number) => String(n).padStart(2, '0')

/** Clock of the recorder: night stays at 02:14, the day walks from 13:20. */
export function nvrTime(mode: CamMode, tick: number): string {
  const sec = pad(tick % 60)
  return mode !== 'day' ? `02:14:${sec}` : `13:${pad(20 + (Math.floor(tick / 60) % 30))}:${sec}`
}

/** „Odstraszanie nocą” toggle: switching it on in the day shows the night (IR). */
export function toggleDeter(state: NvrState): NvrState {
  const night = state.mode !== 'day'
  return {
    ...state,
    deter: !state.deter,
    mode: state.deter ? state.mode : night ? state.mode : 'ir',
  }
}

export type NoteKey = 'noAi' | 'col' | 'ir' | 'day'

/** Which note the recorder shows; the mask sentence is appended when the mask is on. */
export function nvrNoteKey(state: NvrState): NoteKey {
  if (!state.ai) return 'noAi'
  return state.mode
}

export type TimelineEvent = { left: number; kind: 'p' | 'c' | 'f'; mark: string }

const EVENTS: TimelineEvent[] = [
  { left: 8, kind: 'c', mark: 'A' },
  { left: 27, kind: 'p', mark: 'C' },
  { left: 41, kind: 'c', mark: 'A' },
  { left: 55, kind: 'p', mark: 'C' },
  { left: 68, kind: 'p', mark: 'C' },
  { left: 80, kind: 'c', mark: 'A' },
  { left: 91, kind: 'p', mark: 'C' },
]
const FALSE_ALARMS: TimelineEvent[] = [14, 33, 47, 61, 74, 86, 96].map((left) => ({
  left,
  kind: 'f',
  mark: '!',
}))

/** Last 24 h on the timeline: without detection every movement is an alarm too. */
export function timeline(ai: boolean): TimelineEvent[] {
  return ai ? EVENTS : [...EVENTS, ...FALSE_ALARMS]
}

// ── „Ile widać” — DORI (PN-EN 62676-4) ───────────────────────────────────────────────────

export const RESOLUTIONS = [
  { label: '2 MP', px: 1920 },
  { label: '4 MP', px: 2560 },
  { label: '8 MP', px: 3840 },
] as const
export const LENSES = [
  { label: '2,8 mm · ok. 100°', fov: 100 },
  { label: '4 mm · ok. 85°', fov: 85 },
  { label: '6 mm · ok. 55°', fov: 55 },
  { label: '12 mm · ok. 30°', fov: 30 },
] as const
export const DORI_LEVELS = [
  { label: 'Wykrycie', ppm: 25 },
  { label: 'Obserwacja', ppm: 62 },
  { label: 'Rozpoznanie', ppm: 125 },
  { label: 'Identyfikacja', ppm: 250 },
] as const
export const DORI_INITIAL = { res: 1, lens: 0, dist: 12 }
export const DIST_MIN = 2
export const DIST_MAX = 40
/** Distance the zone bar spans (m). */
const SPAN = 40
const ZONE_NAMES = ['Identyfikacja', 'Rozpoznanie', 'Obserwacja', 'Wykrycie']
const ZONE_SHORT = ['Id.', 'Roz.', 'Obs.', 'Wyk.']

export type DoriZone = { name: string; left: string; width: string }

export type DoriResult = {
  ppm: number
  /** Frame width at the distance, Polish decimal comma. */
  width: string
  /** Highest level reached, −1 = not even detection. */
  level: number
  zones: DoriZone[]
  /** The person on the zone bar: position (%) and size. */
  man: { left: string; scale: string }
}

const tanHalf = (fov: number) => Math.tan(((fov / 2) * Math.PI) / 180)

export function dori(res: number, lens: number, dist: number): DoriResult {
  const hres = RESOLUTIONS[res]?.px ?? RESOLUTIONS[1].px
  const fov = LENSES[lens]?.fov ?? LENSES[0].fov
  const w = 2 * dist * tanHalf(fov)
  const ppm = Math.round(hres / w)
  let level = -1
  DORI_LEVELS.forEach((l, i) => {
    if (ppm >= l.ppm) level = i
  })
  const dmax = (t: number) => hres / t / (2 * tanHalf(fov))
  const edges = [dmax(250), dmax(125), dmax(62), dmax(25)].map((v) =>
    Math.min(100, Math.max(0, (v / SPAN) * 100)),
  )
  let prev = 0
  const zones = edges.map((x, i) => {
    const size = x - prev
    const zone = {
      name: size > 14 ? (ZONE_NAMES[i] ?? '') : size > 5 ? (ZONE_SHORT[i] ?? '') : '',
      left: `${prev.toFixed(1)}%`,
      width: `${Math.max(0, size).toFixed(1)}%`,
    }
    prev = x
    return zone
  })
  const mx = Math.min(94, Math.max(6, (dist / SPAN) * 100))
  return {
    ppm,
    width: w.toFixed(1).replace('.', ','),
    level,
    zones,
    man: { left: `calc(${mx.toFixed(1)}% - 11px)`, scale: (1.25 - dist / 60).toFixed(2) },
  }
}

// ── „Ile dni nagrań” ─────────────────────────────────────────────────────────────────────

export const BITRATES = [
  { label: '2 Mb/s', mbps: 2 },
  { label: '4 Mb/s', mbps: 4 },
  { label: '8 Mb/s', mbps: 8 },
] as const
export const DISKS = [
  { label: '2 TB', tb: 2 },
  { label: '4 TB', tb: 4 },
  { label: '8 TB', tb: 8 },
  { label: '16 TB', tb: 16 },
] as const
export const RECORDING_INITIAL = { n: 8, br: 1, tb: 1 }
export const CAMERAS_MIN = 1
export const CAMERAS_MAX = 32

/** Polish „few” form (2–4, 22–24 …, but not 12–14). */
export const fewForm = (k: number) => k % 10 >= 2 && k % 10 <= 4 && (k % 100 < 12 || k % 100 > 14)

export type RecordingTail = 'over' | 'lessDay' | 'few' | 'ok'

export type RecordingResult = {
  /** TB written per day. */
  daily: number
  days: number
  hours: number
  /** The big number and its unit. */
  big: string
  unit: string
  /** Bar width (% of 90 days). */
  bar: string
  /** „8 kamer zapisuje” … */
  cameras: string
  /** TB per day with a Polish decimal comma. */
  dailyText: string
  tail: RecordingTail
}

export function recording(n: number, br: number, tb: number): RecordingResult {
  const mbps = BITRATES[br]?.mbps ?? BITRATES[1].mbps
  const size = DISKS[tb]?.tb ?? DISKS[1].tb
  // TB per day: Mb/s × s ÷ 8 = MB, ÷ 1e6 = TB.
  const daily = (n * mbps * 86400) / 8 / 1e6
  // 95% of the disk, as in the „Wersje instalacji” diagram.
  const daysF = (size * 0.95) / daily
  const days = Math.floor(daysF)
  const hours = Math.floor(daysF * 24)
  const camWord = n === 1 ? 'kamera zapisuje' : fewForm(n) ? 'kamery zapisują' : 'kamer zapisuje'
  const hourWord = hours === 1 ? 'godzina' : fewForm(hours) ? 'godziny' : 'godzin'
  return {
    daily,
    days,
    hours,
    big: String(days >= 1 ? days : hours),
    unit: days >= 1 ? (days === 1 ? 'dzień' : 'dni') : hourWord,
    bar: `${Math.min(100, (daysF / 90) * 100).toFixed(0)}%`,
    cameras: `${n} ${camWord}`,
    dailyText: daily.toFixed(2).replace('.', ','),
    tail: days > 90 ? 'over' : days < 1 ? 'lessDay' : days < 7 ? 'few' : 'ok',
  }
}

// ── „Wersje instalacji” ──────────────────────────────────────────────────────────────────

export const SYSTEM_INITIAL = { version: 2, element: 'nvr' as SystemElementKey }

/** Cameras, recorder and disks are in every version; the rest only with a spec line. */
export function inVersion(version: SystemVersion, key: SystemElementKey): boolean {
  return key === 'cam' || key === 'nvr' || key === 'hdd' || Boolean(version.spec[key])
}

/** Elements of the version in the diagram's order. */
export function versionElements(version: SystemVersion): SystemElementKey[] {
  return SYSTEM_ELEMENT_KEYS.filter((k) => inVersion(version, k))
}

/** The shown element: the picked one, or the recorder when the version does not have it. */
export function shownElement(version: SystemVersion, picked: SystemElementKey): SystemElementKey {
  return inVersion(version, picked) ? picked : 'nvr'
}

/** Previous / next element of the set (wraps around). */
export function stepElement(
  version: SystemVersion,
  picked: SystemElementKey,
  by: 1 | -1,
): SystemElementKey {
  const keys = versionElements(version)
  const at = Math.max(0, keys.indexOf(shownElement(version, picked)))
  return keys[(at + by + keys.length) % keys.length] ?? 'nvr'
}
