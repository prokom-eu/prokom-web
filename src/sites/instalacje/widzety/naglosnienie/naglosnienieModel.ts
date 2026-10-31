import { naglosnienie, type VenueKey } from '../../dane/naglosnienie'

/*
 * Logic of the Nagłośnienie widgets, ported 1:1 from `zrodlo/pages/Naglosnienie.js` (`page()`,
 * `mountPage()`) as pure functions; `naglosnienieModel.test.ts` runs the original and compares
 * the results.
 */

const MX = naglosnienie.mixer

// ── Zone mixer (`mx`) ────────────────────────────────────────────────────────────────────

export const VENUE_KEYS = Object.keys(MX.venues) as VenueKey[]
/** The prototype's clock: autoplay and the announcement count in its ticks. */
export const TICK_MS = 1300
/** An announcement lasts four ticks (`st.tick - st.pri < 4`). */
export const PRIORITY_MS = 4 * TICK_MS

export type MixerState = {
  ven: VenueKey
  /** Fader of each zone, 0–100. */
  lv: readonly number[]
  mu: readonly boolean[]
  /** Source: 0 music, 1 microphone, 2 TV/AUX. */
  src: number
  /** An announcement is on (priority over all zones). */
  pri: boolean
}

export const INITIAL_MIXER: MixerState = {
  ven: 'rest',
  lv: [70, 55, 60, 35],
  mu: [false, false, false, false],
  src: 0,
  pri: false,
}

/** Level → the prototype's dB label (0 = −∞, 100 = 0 dB, −0.4 dB per step). */
export function dbOf(l: number): string {
  if (l <= 0) return '−∞'
  if (l >= 100) return '0 dB'
  return `−${Math.round((100 - l) * 0.4)} dB`
}

/** Segments of a channel meter: 12 lights, yellow from 8, red from 10, the peak marked. */
function meter(lit: number): string[] {
  return Array.from(
    { length: 12 },
    (_, k) =>
      'ms' +
      (k >= 10 ? ' r' : k >= 8 ? ' y' : '') +
      (k < lit ? ' on' : '') +
      (k === lit - 1 ? ' pkk' : ''),
  )
}

export function mixerView(s: MixerState) {
  const zones = MX.venues[s.ven].zones
  // During an announcement every zone plays at 85 % (muted ones stay silent).
  const eff = s.lv.map((l, i) => (s.mu[i] ? 0 : s.pri ? 85 : l))
  return {
    svgClass: `mxp src${s.src}${s.pri ? ' mpri' : ''}`,
    /** Zones of the plan: label, dB, class and the coverage scale (`--lv`). */
    zones: zones.map((name, i) => ({
      name,
      db: s.mu[i] ? MX.mutedZone : dbOf(eff[i]!),
      cls: `m_zg${s.mu[i] ? ' m_mute' : ''}`,
      lv: Math.max(0.12, eff[i]! / 100).toFixed(2),
    })),
    channels: zones.map((name, i) => {
      const lit = s.mu[i] ? 0 : Math.round((eff[i]! / 100) * 12)
      return {
        name,
        db: s.mu[i] ? MX.mutedDb : dbOf(eff[i]!),
        level: s.lv[i]!,
        segments: meter(lit),
        muted: s.mu[i]!,
      }
    }),
    note: s.pri
      ? MX.priorityNote
      : MX.note.replace('{a}', zones[0]!.toLowerCase()).replace('{b}', zones[3]!.toLowerCase()),
  }
}

export const setLevel = (s: MixerState, i: number, value: number): MixerState => ({
  ...s,
  lv: s.lv.map((l, k) => (k === i ? Math.max(0, Math.min(100, Number(value) || 0)) : l)),
})

export const toggleMute = (s: MixerState, i: number): MixerState => ({
  ...s,
  mu: s.mu.map((m, k) => (k === i ? !m : m)),
})

/** Venues the autoplay goes through (`mountPage`: without the council room). */
const AUTOPLAY_VENUES: readonly VenueKey[] = ['rest', 'hotel', 'kos', 'szk', 'hala']

/**
 * Tick `n` (1, 2, …) of the autoplay: every 4th the faders drift, every 9th an announcement,
 * every 14th the next venue.
 */
export function autoplayStep(s: MixerState, n: number): MixerState {
  let next = s
  if (n % 4 === 0) {
    next = {
      ...next,
      lv: next.lv.map((x, k) => Math.max(20, Math.min(95, x + (((n + k) % 3) - 1) * 10))),
    }
  }
  if (n % 9 === 0) next = { ...next, pri: true }
  if (n % 14 === 0) next = { ...next, ven: AUTOPLAY_VENUES[(n / 14) % AUTOPLAY_VENUES.length]! }
  return next
}

// ── Signal chain (`chn`) ─────────────────────────────────────────────────────────────────

const CH = naglosnienie.chain

/** Line 0 = 100 V, 1 = low impedance; `ann` = an announcement on. */
export function chainView(line: number, ann: boolean) {
  const L = CH.lines[line]!
  return {
    sources: CH.sources.map((x) => ({
      ...x,
      cls: 'chs' + (ann ? (x.speaks ? ' on' : ' dim') : x.name === CH.sources[0].name ? ' on' : ''),
    })),
    mixer: L.mixer,
    mixerSub: L.mixerSub,
    amp: L.amp,
    ampSub: L.ampSub,
    zones: L.zones.map(([name, count], i) => ({
      name,
      speakers: Array.from(
        { length: count },
        () => 'chp' + (line === 0 ? ' t' : '') + (ann ? ' a' : ''),
      ),
      value: ann ? CH.announcing : `${CH.music} ${CH.levels[i]}%`,
    })),
    note: L.note,
  }
}

// ── Church (`ko`) ────────────────────────────────────────────────────────────────────────

const KO = naglosnienie.church

export type ChurchState = { vol: number; rev: number; cols: boolean }
export const INITIAL_CHURCH: ChurchState = { vol: 60, rev: 4, cols: false }

const REFLECTIONS = [
  'M120 60 Q210 120 300 60',
  'M90 74 Q210 150 330 74',
  'M150 46 Q210 96 270 46',
] as const

/**
 * Speech intelligibility in a church (an illustration of the rule, not a measurement): reverb
 * lowers it, too quiet or too loud lowers it, directional columns help.
 */
export function churchView({ vol: kv, rev: kr, cols: kc }: ChurchState) {
  let cl = 1 - (kr - 1) * 0.17 + (kc ? (kr - 1) * 0.12 : 0)
  if (kv < 40) cl -= (40 - kv) / 70
  if (kv > 70) cl -= ((kv - 70) / 100) * kr * (kc ? 0.08 : 0.22)
  cl = Math.max(0.08, Math.min(0.95, cl))
  const verdict = cl < 0.45 ? 0 : cl < 0.6 ? 1 : cl < 0.75 ? 2 : 3
  const opacity = Math.min(0.9, (kr / 5) * (kv / 100) * 1.4).toFixed(2)
  return {
    clarity: cl,
    reverb: KO.reverbLevels[kr - 1]!,
    beam: kc ? 'M48 100 L390 160 L390 196 L48 114 Z' : 'M48 90 L400 18 L400 200 L48 126 Z',
    reflections: REFLECTIONS.slice(0, kc ? 1 : 3).map((d) => ({ d, opacity })),
    blur: ((1 - cl) * 3.2).toFixed(1),
    phraseOpacity: (0.45 + cl * 0.55).toFixed(2),
    bar: `${Math.round(cl * 100)}%`,
    text: KO.verdicts[verdict]!,
  }
}

// ── Calculator: how many speakers (`ig`) ─────────────────────────────────────────────────

const IG = naglosnienie.calc

export type CalcState = { area: number; height: number; mode: number }
/** Height in decimetres as the prototype's slider (24–60 = 2.4–6.0 m). */
export const INITIAL_CALC: CalcState = { area: 120, height: 30, mode: 0 }
export const MAX_DOTS = 60

function speakerWord(n: number): 'głośnik' | 'głośniki' | 'głośników' {
  const d = n % 10
  const dd = n % 100
  if (n === 1) return 'głośnik'
  return d >= 2 && d <= 4 && (dd < 12 || dd > 14) ? 'głośniki' : 'głośników'
}

const HANGING = { głośnik: ' wiszący', głośniki: ' wiszące', głośników: ' wiszących' }
const CEILING = { głośnik: ' sufitowy', głośniki: ' sufitowe', głośników: ' sufitowych' }

/**
 * Speakers spaced about two ceiling heights apart (music) or one (speech); above ~4.5 m hanging
 * speakers at ~4 m or columns.
 */
export function speakerCount({ area, height, mode }: CalcState) {
  const hm = height / 10
  const high = hm > 4.5
  const hc = high ? 4 : hm
  const count = (k: number): [number, number] => {
    const x = area / Math.pow(k * hc, 2)
    const lo = Math.max(1, Math.round(x))
    return [lo, Math.max(lo, Math.ceil(x * 1.2))]
  }
  const music = count(2)
  const speech = count(1)
  const cur = mode === 0 ? music : speech
  const word = speakerWord(cur[1])
  const total = Math.min(Math.max(speech[1], cur[1]), MAX_DOTS)
  return {
    heightText: hm.toFixed(1).replace('.', ','),
    result: cur[0] === cur[1] ? String(cur[0]) : `${cur[0]}–${cur[1]}`,
    unit: high ? `${word}${HANGING[word]} albo kolumny` : `${word}${CEILING[word]}`,
    dots: Array.from(
      { length: total },
      (_, i) => (i < Math.min(cur[1], MAX_DOTS) ? 'on' : '') + (mode === 1 ? ' sp' : ''),
    ),
    note:
      (mode === 0 ? IG.notes.music : IG.notes.speech) +
      (high ? IG.notes.high : '') +
      (cur[1] > MAX_DOTS ? IG.notes.dots : '') +
      IG.notes.estimate,
  }
}

// ── Mixer markup ─────────────────────────────────────────────────────────────────────────

const escape = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Markup of the mixer SVG for a state: the venue's plan with its zones filled in. */
export function mixerHtml(
  scene: { base: string; venues: Record<VenueKey, string>; priority: string },
  s: MixerState,
): string {
  const zones = mixerView(s).zones
  const plan = scene.venues[s.ven].replace(
    /%mx\.z(\d)\.(cls|st|n|db)%/g,
    (_, i: string, key: 'cls' | 'st' | 'n' | 'db') => {
      const z = zones[Number(i)]!
      if (key === 'cls') return z.cls
      if (key === 'st') return `--lv:${z.lv}`
      return escape(key === 'n' ? z.name : z.db)
    },
  )
  return scene.base + plan + (s.pri ? scene.priority : '')
}
