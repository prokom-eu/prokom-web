import { CHARGER_KEYS, type ChargerKey, ladowarki } from '../../dane/ladowarki'

/*
 * Logic of the Ładowarki widgets, ported 1:1 from `zrodlo/pages/Ladowarki.js` (`page()`,
 * `mountPage()`) as pure functions; `ladowarkiModel.test.ts` runs the original and compares the
 * results. The „Zapytaj o tę wersję” link carries the configuration (ADR-I002 §4).
 */

const nf = (x: number) => String(x).replace('.', ',')

/** Supply of a charging power: phases and current. */
const PHASES: Record<number, readonly [string, number]> = {
  3.7: ['1 faza', 16],
  7.4: ['1 faza', 32],
  11: ['3 fazy', 16],
  22: ['3 fazy', 32],
}

// ── Version configurator (`cf`) ──────────────────────────────────────────────────────────

/** The prototype's state keys: model and the options of each model. */
export type ConfigState = {
  cm: number
  hp: number
  ho: number
  wp: number
  wk: number
  wo: number
  wm: number
  wc: number
  cp: number
  ck: number
  co: number
}
export type ConfigOption = Exclude<keyof ConfigState, 'cm'>

export const INITIAL_CONFIG: ConfigState = {
  cm: 1,
  hp: 1,
  ho: 0,
  wp: 1,
  wk: 1,
  wo: 0,
  wm: 0,
  wc: 1,
  cp: 1,
  ck: 1,
  co: 0,
}

/** What the configured version is, for the planner (`konf`, ADR-I002 §4). */
export type ChargerConfig = {
  model: string
  punkty: number
  mocNaPunkt: string
  wyjscie: string
  montaz: string
  kolor?: string
}

/** base64url of the UTF-8 JSON (no padding), the same in the browser and in Node. */
export function encodeKonf(config: ChargerConfig): string {
  const bytes = new TextEncoder().encode(JSON.stringify(config))
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** The planner's side (I11): the configuration back from `konf`, `null` when it is not one. */
export function decodeKonf(konf: string): ChargerConfig | null {
  try {
    const binary = atob(konf.replace(/-/g, '+').replace(/_/g, '/'))
    const json: unknown = JSON.parse(
      new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0))),
    )
    if (typeof json !== 'object' || json === null) return null
    const c = json as Partial<ChargerConfig>
    const ok =
      typeof c.model === 'string' &&
      typeof c.punkty === 'number' &&
      typeof c.mocNaPunkt === 'string' &&
      typeof c.wyjscie === 'string' &&
      typeof c.montaz === 'string' &&
      (c.kolor === undefined || typeof c.kolor === 'string')
    return ok ? (c as ChargerConfig) : null
  } catch {
    return null
  }
}

type Option = { label: string; key: ConfigOption; choices: readonly string[] }

export function configView(s: ConfigState) {
  const key: ChargerKey = CHARGER_KEYS[s.cm]!
  const model = ladowarki.models[key]
  let options: Option[]
  let title: string
  let out: [string, string][]
  let install: string
  let object: string
  let config: ChargerConfig
  let colour: { name: string; token: string } | null = null
  if (key === 'home') {
    const kw = ([3.7, 7.4, 11] as const)[s.hp]!
    const ph = PHASES[kw]!
    const output = ['gniazdo Typ 2', 'przewód 5 m'][s.ho]!
    options = [
      { label: 'Moc', key: 'hp', choices: ['3,7 kW', '7,4 kW', '11 kW'] },
      { label: 'Wyjście', key: 'ho', choices: ['Gniazdo Typ 2', 'Przewód 5 m'] },
    ]
    title = `CC Home · ${nf(kw)} kW · ${output}`
    out = [
      ['Moc ładowania', `${nf(kw)} kW`],
      ['Zasilanie', `${ph[0]}, ${ph[1]} A`],
      ['Montaż', 'na ścianie, wewnątrz lub pod wiatą'],
      ['Obudowa', 'IP44, IK08, −25 do +40°C'],
      ['Dostęp', 'tryb domowy, bez autoryzacji'],
      ['Wymiary', 'Ø361 mm, 5 kg'],
    ]
    install =
      kw === 11
        ? 'Potrzebne zasilanie trójfazowe. Sprawdzimy, czy przyłącze ma zapas ok. 16 A na każdej fazie.'
        : `Wystarczy zasilanie jednofazowe. Sprawdzimy, czy przyłącze ma zapas ok. ${ph[1]} A na fazie, z której zasilimy ładowarkę.`
    object = 'dom'
    config = {
      model: model.name,
      punkty: 1,
      mocNaPunkt: `${nf(kw)} kW`,
      wyjscie: output,
      montaz: 'na ścianie',
    }
  } else if (key === 'wall') {
    const n = s.wp + 1
    const kw = ([11, 22] as const)[s.wk]!
    const ph = PHASES[kw]!
    const output = ['gniazdo', 'przewód 7,5 m'][s.wo]!
    const mount = ['na ścianę', 'na podstawie'][s.wm]!
    options = [
      { label: 'Punkty ładowania', key: 'wp', choices: ['1 auto', '2 auta naraz'] },
      { label: 'Moc na punkt', key: 'wk', choices: ['11 kW', '22 kW'] },
      { label: 'Wyjście', key: 'wo', choices: ['Gniazdo Typ 2', 'Przewód 7,5 m'] },
      { label: 'Montaż', key: 'wm', choices: ['Na ścianę', 'Na podstawie'] },
    ]
    title = `CC Wall · ${n}×${kw} kW · ${output} · ${mount}`
    out = [
      ['Moc ładowania', `${n}×${kw} kW`],
      ['Zasilanie', `3 fazy, ${n > 1 ? '2×' : ''}${ph[1]} A`],
      ['Montaż', ['na ścianie', 'na dedykowanej podstawie'][s.wm]!],
      ['Obudowa', 'IP54, IK10, −25 do +40°C'],
      ['Dostęp', 'karta RFID, aplikacja'],
      ['Wymiary', '688×452×238 mm, 39 kg'],
    ]
    install =
      `Do pełnej mocy przyłącze potrzebuje zapasu ok. ${ph[1] * n} A na fazę. ` +
      (n > 1
        ? 'Gdy go brakuje, dzielenie mocy rozkłada prąd między oba auta.'
        : 'Gdy go brakuje, ustawiamy niższą moc ładowania.')
    object = 'firma'
    const [name, token] = ladowarki.config.colours[s.wc]!
    colour = { name, token }
    config = {
      model: model.name,
      punkty: n,
      mocNaPunkt: `${kw} kW`,
      wyjscie: output,
      montaz: mount,
      kolor: name,
    }
  } else {
    const n = s.cp + 1
    const kw = ([11, 22] as const)[s.ck]!
    const ph = PHASES[kw]!
    const output = ['gniazdo', 'przewód'][s.co]!
    options = [
      { label: 'Punkty ładowania', key: 'cp', choices: ['1 auto', '2 auta naraz'] },
      { label: 'Moc na punkt', key: 'ck', choices: ['11 kW', '22 kW'] },
      { label: 'Wyjście', key: 'co', choices: ['Gniazdo Typ 2', 'Przewód Typ 2'] },
    ]
    title = `CC City · ${n}×${kw} kW · ${output}`
    out = [
      ['Moc ładowania', `${n}×${kw} kW`],
      ['Zasilanie', `3 fazy, ${n > 1 ? '2×' : ''}${ph[1]} A`],
      ['Montaż', 'wolnostojąca, na fundamencie'],
      ['Licznik', 'MID'],
      ['Łączność', 'GSM, OCPP 1.5/1.6, Modbus RS485'],
      ['Wymiary', '1360×262×217 mm, 60 kg'],
    ]
    install = `Do stacji prowadzimy zasilanie w ziemi i robimy fundament. Do pełnej mocy przyłącze potrzebuje zapasu ok. ${ph[1] * n} A na fazę, a przy kilku stacjach ustawiamy dzielenie mocy.`
    object = 'pens'
    config = {
      model: model.name,
      punkty: n,
      mocNaPunkt: `${kw} kW`,
      wyjscie: output,
      montaz: 'wolnostojąca, na fundamencie',
    }
  }
  return {
    key,
    options,
    title,
    out,
    install,
    colour,
    href: `/zaplanuj#obiekt=${object}&uslugi=ev&konf=${encodeKonf(config)}`,
  }
}

// ── Charging time calculator (`ev`) ──────────────────────────────────────────────────────

const C = ladowarki.calc

export const RANGES = [
  [20, 80, '20 → 80%'],
  [10, 100, '10 → 100%'],
  [40, 80, '40 → 80%'],
] as const
export const POWERS = [
  [3.7, '3,7 kW'],
  [7.4, '7,4 kW'],
  [11, '11 kW'],
  [22, '22 kW'],
] as const
export const ON_BOARD = [
  [7.4, '7,4 kW'],
  [11, '11 kW'],
  [22, '22 kW'],
] as const
const SUPPLY: Record<number, string> = {
  3.7: '1 faza, 16 A',
  7.4: '1 faza, 32 A',
  11: '3 fazy, 16 A',
  22: '3 fazy, 32 A',
}

export type CalcState = { path: number; bat: number; rg: number; pw: number; obc: number }
export const INITIAL_CALC: CalcState = { path: 0, bat: 60, rg: 1, pw: 2, obc: 1 }
/** The battery fills in twelve steps (`anim`, every 0.9 s). */
export const ANIM_STEPS = 12
export const ANIM_MS = 900
export const PATH_MS = 5200
export const SHOWCASE_MS = 4600

/** A place to charge: its usual power and car (`[2, 3, 3]`, `[1, 1, 2]`). */
export const pickPath = (s: CalcState, path: number): CalcState => ({
  ...s,
  path,
  pw: ([2, 3, 3] as const)[path]!,
  obc: ([1, 1, 2] as const)[path]!,
})

/** CC Home charges at up to 11 kW: 22 kW is not offered at home. */
export const homeLimited = (s: CalcState, i: number) => s.path === 0 && i > 2

export function calcView(s: CalcState, anim: number) {
  const pwIndex = s.path === 0 && s.pw > 2 ? 2 : s.pw
  const r = RANGES[s.rg]!
  const pw = POWERS[pwIndex]![0]
  const ob = ON_BOARD[s.obc]![0]
  const eff = Math.min(pw, ob)
  const kwh = (s.bat * (r[1] - r[0])) / 100
  const hrs = kwh / eff
  const hh = Math.floor(hrs)
  const mm = Math.round((hrs - hh) * 60)
  const pct = Math.round(r[0] + ((r[1] - r[0]) * anim) / (ANIM_STEPS - 1))
  let note: string = C.notes.base
  if (s.path === 0) note = C.notes.home + note
  if (pw > ob) note = C.notes.car.replace('{kw}', nf(ob)) + note
  return {
    pw: pwIndex,
    device: C.paths[s.path]!.device,
    kw: `${nf(eff)} kW`,
    pct,
    fill: `${((178 * pct) / 100).toFixed(0)}px`,
    time: `${hh} h ${String(mm).padStart(2, '0')} min`,
    kwh: kwh.toFixed(1).replace('.', ','),
    eff: nf(eff),
    supply: SUPPLY[pw]!,
    note,
  }
}

/** Snowflakes of the winter scene: position, size and their own pace. */
export const FLAKES = Array.from({ length: 26 }, (_, i) => ({
  x: (i * 53) % 640,
  y: (i * 37) % 120,
  r: 1.2 + (i % 3) * 0.6,
  duration: `${5 + (i % 5)}s`,
  delay: `-${i % 7}s`,
}))
