import { type RoomKey, type RoomStateKey, type SceneKey, smartHome } from '../../dane/smartHome'

/*
 * Logic of the Smart home widgets, ported 1:1 from `zrodlo/pages/SmartHome.js` (`sceneState()`,
 * `page()`, `mountPage()`) as pure functions; `smartHomeModel.test.ts` runs the original and
 * compares the results.
 */

const PLAN = smartHome.plan
export const ROOM_KEYS = Object.keys(PLAN.rooms) as RoomKey[]

// ── Floor plan (`sh`) ────────────────────────────────────────────────────────────────────

export type RoomControls = { l: number; b: number; t: number }
export type PlanState = {
  rs: Record<RoomKey, RoomControls>
  gate: boolean
  /** Alarm label: '' (disarmed), 'UZBR', 'NOC'. */
  al: string
  /** The active scene; '' after a manual change. */
  scene: SceneKey | ''
  sel: RoomKey
  off: boolean
}

const PRESETS: Record<
  SceneKey,
  {
    l: Partial<Record<RoomKey, number>>
    b: Partial<Record<RoomKey, number>>
    t: number
    gate: boolean
    al: string
  }
> = {
  rano: { l: { kuch: 70, hol: 40, laz: 60 }, b: {}, t: 21, gate: false, al: '' },
  wyj: { l: {}, b: { sal: 50, syp: 50 }, t: 17, gate: false, al: 'UZBR' },
  kino: { l: { sal: 15 }, b: { sal: 100 }, t: 21, gate: false, al: '' },
  noc: {
    l: { hol: 5 },
    b: { sal: 100, kuch: 100, syp: 100, laz: 100, gab: 100 },
    t: 20,
    gate: false,
    al: 'NOC',
  },
  przyj: { l: { hol: 80, sal: 60, kuch: 40, tar: 60, gar: 70 }, b: {}, t: 21, gate: true, al: '' },
}

/** A scene: light, blinds and temperature of every room (bathroom +2°, bedroom at night 19°). */
export function sceneState(k: SceneKey): Pick<PlanState, 'rs' | 'gate' | 'al' | 'scene'> {
  const S = PRESETS[k]
  const rs = Object.fromEntries(
    ROOM_KEYS.map((r) => [
      r,
      {
        l: S.l[r] ?? 0,
        b: S.b[r] ?? 0,
        t: r === 'laz' ? S.t + 2 : k === 'noc' && r === 'syp' ? 19 : S.t,
      },
    ]),
  ) as Record<RoomKey, RoomControls>
  return { rs, gate: S.gate, al: S.al, scene: k }
}

export const INITIAL_PLAN: PlanState = { ...sceneState('przyj'), sel: 'sal', off: false }

/** Autoplay (`mountPage`, every 3.2 s until the first touch): the next scene and room. */
const AUTO_SCENES: SceneKey[] = ['przyj', 'kino', 'noc', 'rano', 'wyj']
const AUTO_ROOMS: RoomKey[] = ['sal', 'kuch', 'syp', 'hol']
export const AUTOPLAY_MS = 3200

export function autoplayStep(step: number): PlanState {
  const i = (step + 1) % AUTO_SCENES.length
  return { ...sceneState(AUTO_SCENES[i]!), sel: AUTO_ROOMS[i % AUTO_ROOMS.length]!, off: i === 2 }
}

export type Control = 'l' | 'b' | 't'

/** − / + of the room card: light ±20 %, blinds ±25 % (0–100), temperature ±1°. */
export function adjust(state: PlanState, control: Control, up: boolean): PlanState {
  const now = state.rs[state.sel]
  const value =
    control === 't'
      ? now.t + (up ? 1 : -1)
      : control === 'l'
        ? up
          ? Math.min(100, now.l + 20)
          : Math.max(0, now.l - 20)
        : up
          ? Math.min(100, now.b + 25)
          : Math.max(0, now.b - 25)
  return { ...state, rs: { ...state.rs, [state.sel]: { ...now, [control]: value } }, scene: '' }
}

export type PlanView = {
  rooms: {
    key: RoomKey
    name: string
    x: number
    y: number
    w: number
    h: number
    cx: number
    cy: number
    rx: number
    ry: number
    /** Opacity of the light glow (`toFixed(2)` as in the prototype). */
    glow: string
    temp: string
    terrace: boolean
    selected: boolean
  }[]
  windows: {
    x: number
    y: number
    w: number
    h: number
    bw: number | string
    bh: number | string
  }[]
  gateWidth: number
  alarm: { armed: boolean; text: string }
  app: string
  note: string
}

export function planView(state: PlanState): PlanView {
  const rooms = ROOM_KEYS.map((key) => {
    const g = PLAN.rooms[key]
    const s = state.rs[key]
    return {
      key,
      name: g.name,
      x: g.x,
      y: g.y,
      w: g.w,
      h: g.h,
      cx: g.x + g.w / 2,
      cy: g.y + g.h / 2,
      rx: g.w * 0.55,
      ry: g.h * 0.55,
      glow: ((s.l / 100) * 0.95).toFixed(2),
      temp: key === 'tar' || key === 'gar' ? '' : `${s.t}°`,
      terrace: key === 'tar',
      selected: state.sel === key,
    }
  })
  const windows = PLAN.windows.map(([room, x, y, w, h]) => {
    const b = state.rs[room].b / 100
    const horizontal = w > h
    return {
      x,
      y,
      w,
      h,
      bw: horizontal ? (w * b).toFixed(1) : w,
      bh: horizontal ? h : (h * b).toFixed(1),
    }
  })
  const note =
    (state.scene ? PLAN.notes[state.scene] : PLAN.manualNote) + (state.off ? PLAN.offlineNote : '')
  return {
    rooms,
    windows,
    gateWidth: state.gate ? 24 : 160,
    alarm: { armed: Boolean(state.al), text: state.al || PLAN.alarm },
    app: state.off ? PLAN.net.appOff : PLAN.net.appOn,
    note,
  }
}

// ── Failure demo (`fl`) ──────────────────────────────────────────────────────────────────

/** Rooms of the failure demo: all off with one controller, only module 5 with Ampio. */
export function failureRooms(fail: boolean): { central: boolean[]; modular: boolean[] } {
  const six = [0, 1, 2, 3, 4, 5]
  return { central: six.map(() => fail), modular: six.map((i) => fail && i === 4) }
}

// ── Rooms of the guesthouse (`rb`) ───────────────────────────────────────────────────────

const NEXT: Record<RoomStateKey, RoomStateKey> = { g: 'e', e: 'c', c: 'g' }

/** A click on a room: guest → empty → cleaning → guest. */
export function cycleRoom(rooms: RoomStateKey[], index: number): RoomStateKey[] {
  return rooms.map((r, i) => (i === index ? NEXT[r] : r))
}

/** „2 pokoje w trybie eko” — Polish plural of the rooms in eco mode. */
export function ecoSummary(rooms: RoomStateKey[]): string {
  const n = rooms.filter((r) => r === 'e').length
  const word = n === 1 ? 'pokój' : n < 5 && n > 1 ? 'pokoje' : 'pokoi'
  return `${n} ${word} ${smartHome.objects.ecoSuffix}`
}

// ── Checklist before plastering (`ck`) and panel fields (`pn`) ───────────────────────────

/** Adds or removes an item (the prototype's toggle, order of clicks kept). */
export function toggle(list: number[], i: number): number[] {
  return list.includes(i) ? list.filter((x) => x !== i) : [...list, i]
}

export function checklistProgress(done: number[]): { width: string; text: string } {
  const C = smartHome.stages.checklist
  const all = C.items.length
  return {
    width: `${Math.round((done.length / all) * 100)}%`,
    text: done.length === all ? C.done : `${C.progress} ${done.length} ${C.of} ${all}`,
  }
}
