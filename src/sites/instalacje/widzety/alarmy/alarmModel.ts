import {
  ALARM_ELEMENT_KEYS,
  type AlarmElementKey,
  type AlarmMessageKey,
  type AlarmMode,
  type AlarmTest,
  alarmy,
} from '../../dane/alarmy'

/*
 * Logic of the Alarmy widgets, ported 1:1 from `zrodlo/pages/Alarmy.js` (`page()`, `mountPage()`)
 * as pure functions; `alarmModel.test.ts` runs the original `page()` and compares the results.
 */

const pad = (n: number) => String(n).padStart(2, '0')

// ── House cross-section (`al`) ───────────────────────────────────────────────────────────

/** The prototype's global tick (`common.js`): steps of a test and the app clock. */
export const TICK_MS = 1300

type Floor = 'up' | 'dn'
export type RoomKey = 'syp' | 'kor' | 'pok' | 'sal' | 'hol' | 'kuch' | 'gar'

export const ROOMS: {
  key: RoomKey
  name: string
  x: number
  y: number
  w: number
  h: number
  floor: Floor
}[] = [
  { key: 'syp', name: 'Sypialnia', x: 96, y: 140, w: 170, h: 106, floor: 'up' },
  { key: 'kor', name: 'Korytarz', x: 266, y: 140, w: 60, h: 106, floor: 'up' },
  { key: 'pok', name: 'Pokój', x: 326, y: 140, w: 138, h: 106, floor: 'up' },
  { key: 'sal', name: 'Salon', x: 96, y: 246, w: 140, h: 106, floor: 'dn' },
  { key: 'hol', name: 'Wejście', x: 236, y: 246, w: 72, h: 106, floor: 'dn' },
  { key: 'kuch', name: 'Kuchnia', x: 308, y: 246, w: 156, h: 106, floor: 'dn' },
  { key: 'gar', name: 'Garaż', x: 464, y: 232, w: 140, h: 120, floor: 'dn' },
]

type SensorKind = 'Ruch' | 'Okno' | 'Drzwi' | 'Taras' | 'Brama' | 'Dym' | 'Woda' | 'Temp.'

/** Sensors: id, kind, position, room; `allDay` = smoke, water, temperature (always armed). */
export const SENSORS: {
  id: string
  kind: SensorKind
  x: number
  y: number
  room: RoomKey
  allDay: boolean
}[] = [
  { id: 's1', kind: 'Ruch', x: 200, y: 272, room: 'sal', allDay: false },
  { id: 's2', kind: 'Okno', x: 155, y: 306, room: 'sal', allDay: false },
  { id: 's3', kind: 'Drzwi', x: 272, y: 290, room: 'hol', allDay: false },
  { id: 's4', kind: 'Ruch', x: 444, y: 266, room: 'kuch', allDay: false },
  { id: 's5', kind: 'Taras', x: 397, y: 300, room: 'kuch', allDay: false },
  { id: 's6', kind: 'Dym', x: 330, y: 290, room: 'kuch', allDay: true },
  { id: 's7', kind: 'Woda', x: 330, y: 336, room: 'kuch', allDay: true },
  { id: 's8', kind: 'Ruch', x: 586, y: 252, room: 'gar', allDay: false },
  { id: 's9', kind: 'Brama', x: 534, y: 256, room: 'gar', allDay: false },
  { id: 's10', kind: 'Temp.', x: 498, y: 336, room: 'gar', allDay: true },
  { id: 's11', kind: 'Dym', x: 230, y: 168, room: 'syp', allDay: true },
  { id: 's12', kind: 'Ruch', x: 296, y: 196, room: 'kor', allDay: false },
]

const LETTER: Record<SensorKind, string> = {
  Ruch: 'R',
  Okno: 'O',
  Drzwi: 'O',
  Taras: 'O',
  Brama: 'O',
  Dym: 'D',
  Woda: 'W',
  'Temp.': 'T',
}

export type Simulation = { test: AlarmTest; t0: number } | null

export type HouseView = {
  alarm: boolean
  siren: boolean
  rooms: { key: RoomKey; name: string; x: number; y: number; w: number; h: number; cls: string }[]
  sensors: { id: string; kind: SensorKind; letter: string; x: number; y: number; cls: string }[]
  /** Newest first, at most two. */
  messages: { key: AlarmMessageKey; alarm: boolean }[]
  status: 'alarm' | AlarmMode
  clock: string
  note: string
}

const roomArmed = (mode: AlarmMode, floor: Floor) =>
  mode === 'full' || (mode === 'night' && floor === 'dn')
const isArmed = (mode: AlarmMode, room: RoomKey) =>
  roomArmed(mode, ROOMS.find((r) => r.key === room)?.floor ?? 'up')

export function house(mode: AlarmMode, sim: Simulation, tick: number): HouseView {
  const step = sim ? Math.max(0, tick - sim.t0) : -1
  let alarm = false
  let siren = false
  let alarmSensors: string[] = []
  let alarmRooms: RoomKey[] = []
  const messages: { key: AlarmMessageKey; alarm: boolean }[] = []
  const say = (key: AlarmMessageKey, al: boolean) => messages.push({ key, alarm: al })

  if (sim?.test === 'in') {
    alarmSensors = ['s5']
    if (step >= 1) alarmSensors.push('s4')
    if (!isArmed(mode, 'kuch')) {
      say('inInfo', false)
    } else {
      say('inDoor', true)
      if (step >= 1) say('inMotion', true)
      if (step >= 2) {
        alarm = true
        siren = true
        alarmRooms = ['kuch']
        say('inAlarm', true)
      }
      if (step >= 3) say('inCamera', false)
    }
  } else if (sim?.test === 'water') {
    alarmSensors = ['s7']
    alarm = true
    alarmRooms = ['kuch']
    say('water', true)
    if (step >= 1) say('waterValve', false)
  } else if (sim?.test === 'smoke') {
    alarmSensors = ['s6']
    alarm = true
    siren = step >= 1
    alarmRooms = ['kuch']
    say('smoke', true)
    if (step >= 1) say('smokeSiren', true)
  }

  const n = alarmy.house.note
  return {
    alarm,
    siren,
    rooms: ROOMS.map(({ floor, ...r }) => ({
      ...r,
      cls: `hroom${alarmRooms.includes(r.key) ? ' al' : roomArmed(mode, floor) ? ' arm' : ''}`,
    })),
    sensors: SENSORS.map((s) => ({
      id: s.id,
      kind: s.kind,
      letter: LETTER[s.kind],
      x: s.x,
      y: s.y,
      cls: `sg${alarmSensors.includes(s.id) ? ' al' : s.allDay ? ' d24' : isArmed(mode, s.room) ? ' arm' : ''}`,
    })),
    messages: messages.reverse().slice(0, 2),
    status: alarm ? 'alarm' : mode,
    clock: `02:${pad(14 + (Math.floor(tick / 46) % 40))}`,
    note: n.legend + n[mode],
  }
}

/** Autoplay of the house (`mountPage`): each scenario starts its test on the 2nd tick and lasts 9. */
const SCENARIOS: readonly [AlarmMode, AlarmTest][] = [
  ['full', 'in'],
  ['night', 'water'],
  ['off', 'in'],
  ['night', 'smoke'],
]

export type HouseAutoplay = { scenario: number; n: number; mode: AlarmMode; sim: Simulation }

export const INITIAL_HOUSE: HouseAutoplay = { scenario: 0, n: 0, mode: 'full', sim: null }

/** One autoplay step at the global `tick` (before the first touch). */
export function houseAutoplayStep(state: HouseAutoplay, tick: number): HouseAutoplay {
  const n = state.n + 1
  let next: HouseAutoplay = { ...state, n }
  if (n === 2) next = { ...next, sim: { test: SCENARIOS[state.scenario]![1], t0: tick } }
  if (n >= 9) {
    const scenario = (state.scenario + 1) % SCENARIOS.length
    next = { scenario, n: 0, mode: SCENARIOS[scenario]![0], sim: null }
  }
  return next
}

// ── Alarm versions (`av`) ────────────────────────────────────────────────────────────────

export const VERSION_INITIAL = 2

export function versionItems(index: number): { key: AlarmElementKey; on: boolean }[] {
  const keys = alarmy.versions.items[index]?.keys ?? []
  return ALARM_ELEMENT_KEYS.map((key) => ({ key, on: keys.includes(key) }))
}

// ── Door phone (`vd`) ────────────────────────────────────────────────────────────────────

export const DOOR_MS = 2600
/** Which button is lit in each state of the call (−1 = none). */
const DOOR_ON = [0, 1, 2, -1] as const

export function doorPhone(state: number) {
  const on = DOOR_ON[state] ?? -1
  return {
    time: `14:${pad(32 + state)}`,
    ringing: state === 0,
    talk: on === 0 || on === 1,
    gate: on === 2,
  }
}

// ── Holiday house (`dl`) ─────────────────────────────────────────────────────────────────

export const HOLIDAY_INITIAL = 12
export const HOLIDAY_MIN = 1
export const HOLIDAY_MAX = 60
const MONTHS = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
]
/** The day of leaving in the story (31 October 2026). */
const LEFT = Date.UTC(2026, 9, 31)

const degrees = (t: number) => `${String(t).replace('-', '−')}°C`

export type HolidayView = {
  date: string
  clock: string
  inside: { value: string; bad: boolean }
  outside: string
  leak: boolean
  /** Newest first, at most four; empty = nothing happened yet. */
  feed: { icon: string; title: string; sub: string; tone: 'ok' | 'warn' | 'bad' }[]
}

export function holiday(day: number): HolidayView {
  const date = new Date(LEFT + day * 86400000)
  const inside = day < 34 ? 12 : day < 36 ? 4 : 11
  const outside = day < 20 ? -3 : day < 34 ? -9 : day < 36 ? -18 : -11
  const h = alarmy.holiday
  const when = (d: number) =>
    d === day ? h.when.today : day - d === 1 ? h.when.yesterday : `${day - d} ${h.when.daysAgo}`
  return {
    date: `${date.getUTCDate()} ${MONTHS[date.getUTCMonth()]}`,
    clock: day >= 34 && day < 36 ? '03:12' : '08:00',
    inside: { value: degrees(inside), bad: inside < 6 },
    outside: degrees(outside),
    leak: day === 35,
    feed: h.events
      .filter((e) => (e.shownFrom ?? e.day) <= day)
      .slice(-4)
      .reverse()
      .map((e) => ({
        icon: e.icon,
        title: e.title,
        sub: `${when(e.day)} · ${e.sub}`,
        tone: e.tone,
      })),
  }
}

// ── Intercom question (`dm`) ─────────────────────────────────────────────────────────────

export const INTERCOM_INITIAL = 0
