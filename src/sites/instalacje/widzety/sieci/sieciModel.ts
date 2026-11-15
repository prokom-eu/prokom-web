import { type NetMode, sieci, type VlanKey } from '../../dane/sieci'

/*
 * Logic of the Sieci i Wi-Fi widgets, ported 1:1 from `zrodlo/pages/Sieci.js` (`page()`,
 * `mountPage()`) as pure functions; `sieciModel.test.ts` runs the original and compares.
 */

// ── Coverage map (`wf`) ──────────────────────────────────────────────────────────────────

const SOURCES: Record<NetMode, [x: number, y: number, name: string][]> = {
  po: [
    [170, 170, 'AP 1'],
    [470, 170, 'AP 2'],
    [320, 292, 'AP 3'],
  ],
  przed: [[64, 300, 'Router']],
}
export const ROOMS: [name: string, x: number, y: number, w: number, h: number][] = [
  ['Pokój 1', 20, 20, 150, 120],
  ['Pokój 2', 170, 20, 150, 120],
  ['Pokój 3', 320, 20, 150, 120],
  ['Pokój 4', 470, 20, 150, 120],
  ['Korytarz', 20, 140, 600, 60],
  ['Recepcja', 20, 200, 200, 140],
  ['Jadalnia', 220, 200, 250, 140],
  ['Kuchnia', 470, 200, 150, 140],
]
/** Devices on the floor plan: network, icon, position. */
export const DEVICES: [vlan: VlanKey, icon: string, x: number, y: number][] = [
  ['g', 'phone', 95, 95],
  ['g', 'phone', 245, 100],
  ['g', 'phone', 395, 95],
  ['g', 'phone', 560, 100],
  ['g', 'phone', 330, 250],
  ['k', 'cam', 130, 185],
  ['k', 'cam', 600, 160],
  ['k', 'cam', 600, 320],
  ['b', 'office', 150, 300],
  ['b', 'card', 190, 260],
  ['s', 'tv', 430, 320],
  ['s', 'thermo', 540, 60],
  ['s', 'scr', 120, 220],
]
export const VLAN_KEYS: VlanKey[] = ['g', 'k', 'b', 's']

export type CoverageView = {
  sources: { x: number; y: number; r: number; label: string }[]
  rooms: { name: string; x: number; y: number; w: number; h: number; quality: number }[]
  tag: string
  note: string
}

export function coverage(mode: NetMode, vlan: VlanKey | ''): CoverageView {
  const src = SOURCES[mode]
  const po = mode === 'po'
  const q = (x: number, y: number) => {
    let d = 1e9
    for (const s of src) d = Math.min(d, Math.hypot(s[0] - x, s[1] - y))
    return d < 150 ? 3 : d < 230 ? 2 : d < 320 ? 1 : 0
  }
  let sum = 0
  const rooms = ROOMS.map(([name, x, y, w, h]) => {
    const quality = q(x + w / 2, y + h / 2)
    sum += quality
    return { name, x, y, w, h, quality }
  })
  const C = sieci.coverage
  return {
    sources: src.map(([x, y, name]) => ({
      x,
      y,
      r: po ? 230 : 300,
      label: name.replace('Router', 'R').replace('AP ', ''),
    })),
    rooms,
    tag: po ? C.tagAfter : `${Math.round((sum / (ROOMS.length * 3)) * 100)}% ${C.tagBefore}`,
    note: po
      ? vlan
        ? `${sieci.vlans[vlan].name}: ${sieci.vlans[vlan].text}`
        : C.noteAfter
      : C.noteBefore,
  }
}

export type NetState = { mode: NetMode; vlan: VlanKey | '' }
export const INITIAL_NET: NetState = { mode: 'po', vlan: '' }
export const AUTOPLAY_MS = 2400
const AUTOPLAY_VLANS: (VlanKey | '')[] = ['', 'g', 'k', 'b', 's']

/** Autoplay (`mountPage`): every 6th step flips before/after, otherwise the next network. */
export type NetAutoplay = NetState & { i: number; n: number }
export const INITIAL_NET_AUTOPLAY: NetAutoplay = { ...INITIAL_NET, i: 0, n: 0 }
export function netAutoplayStep(s: NetAutoplay): NetAutoplay {
  const n = s.n + 1
  if (n % 6 === 0) return { ...s, n, mode: s.mode === 'po' ? 'przed' : 'po', vlan: '' }
  if (s.mode === 'po') {
    const i = (s.i + 1) % AUTOPLAY_VLANS.length
    return { ...s, n, i, vlan: AUTOPLAY_VLANS[i]! }
  }
  return { ...s, n }
}

/** Picking a network always shows the „after” plan; „before” clears the network. */
export const pickMode = (s: NetState, mode: NetMode): NetState => ({
  mode,
  vlan: mode === 'przed' ? '' : s.vlan,
})
export const pickVlan = (s: NetState, vlan: VlanKey): NetState => ({
  mode: 'po',
  vlan: s.vlan === vlan ? '' : vlan,
})

// ── Guest portal code (`pt`) ─────────────────────────────────────────────────────────────

/** The voucher changes every four ticks of the prototype's 1.3 s clock. */
export const portalCode = (tick: number) =>
  sieci.portal.screen.codes[Math.floor(tick / 4) % sieci.portal.screen.codes.length]!

// ── „Sprawdź sam” (`lb`) ─────────────────────────────────────────────────────────────────

export const WALLS: [name: string, db24: number, db5: number][] = [
  ['Płyta g-k', 2.5, 3.5],
  ['Drzwi drewniane', 1.9, 3.2],
  ['Cegła, kamień', 4, 7.7],
  ['Lekki beton', 8, 16],
  ['Ciężki beton, strop', 22, 44],
  ['Okno z powłoką', 20, 40],
]
export const LAB_INITIAL = { band: 1, wall: 3, len: 70, speed: 1, dist: 1, dig: 1, see: 0 }

export function wall(band: number, wallIndex: number) {
  const w = WALLS[wallIndex] ?? WALLS[0]!
  const db = band === 0 ? w[1] : w[2]
  const level = db < 5 ? 5 : db < 10 ? 4 : db < 20 ? 3 : db < 35 ? 2 : 1
  const T = sieci.lab.walls.texts
  return {
    db: String(db).replace('.', ','),
    /** Five bars: lit up to the level, tinted when weak. */
    bars: [1, 2, 3, 4, 5].map(
      (i) => (i <= level ? 'on' : '') + (level <= 2 ? ' bad' : level === 3 ? ' mid' : ''),
    ),
    text: wallIndex === 2 ? T.brick : db >= 20 ? T.blocks : db >= 8 ? T.weak : T.light,
  }
}

export const SPEEDS: [label: string, gbps: number][] = [
  ['1 Gb/s', 1],
  ['2,5 Gb/s', 2.5],
  ['10 Gb/s', 10],
]
export const LEN_MIN = 10
export const LEN_MAX = 100

export function cable(len: number, speed: number) {
  const [label, sp] = SPEEDS[speed] ?? SPEEDS[1]!
  const ok = sp < 10 || len <= 55
  return {
    ok,
    title: ok ? sieci.lab.cable.ok : sieci.lab.cable.needA,
    text: ok
      ? sp === 10
        ? `Przy ${len} m Cat6 da jeszcze 10 Gb/s. Przy nowej budowie i tak warto rozważyć Cat6A na zapas.`
        : `Do ${label} na ${len} m Cat6 w zupełności wystarcza.`
      : `Na ${len} m Cat6 nie da 10 Gb/s. Cat6A przenosi je na pełnych 100 m.`,
  }
}

/** Link between buildings: distance (0 ≤ 100 m, 1 ≤ 500 m, 2 more), can dig, can see (0 = yes). */
export function link(dist: number, dig: number, see: number) {
  const seeAlt = see === 0
  if (dist === 0 && dig === 0)
    return {
      title: 'Skrętka zewnętrzna albo światłowód',
      text:
        'Do 100 m wystarczy skrętka, ale między budynkami z osobnym zasilaniem bezpieczniejszy jest światłowód: nie przewodzi prądu, więc nie przeniesie przepięcia.' +
        (seeAlt
          ? ' Most radiowy też zadziała, ale na tak krótkim odcinku kabel jest pewniejszy.'
          : ''),
      icon: 'fiber',
    }
  if (dist === 0 && seeAlt)
    return {
      title: 'Most radiowy',
      text: 'Kopać się nie da, a budynki się widzą: na krótki odcinek wystarczy mały most radiowy, np. 60 GHz, bez prac ziemnych. Anteny montujemy na ścianach albo na uchwytach.',
      icon: 'ant',
    }
  if (dist === 0)
    return {
      title: 'Wyższy punkt albo przewód napowietrzny',
      text: 'Most radiowy potrzebuje widoczności między antenami. Sprawdzamy, czy pomoże maszt albo punkt pośredni. Na krótkim odcinku można też poprowadzić przewód napowietrzny, np. światłowód na lince nośnej.',
      icon: 'eye',
    }
  if (dig === 0)
    return {
      title: 'Światłowód',
      text:
        'Przy takiej odległości kładziemy światłowód w rurze osłonowej. Jednomodowy obsłuży nawet kilometry, a spawy mierzymy reflektometrem.' +
        (seeAlt ? ' Budynki się widzą, więc alternatywą bez wykopu jest most radiowy.' : ''),
      icon: 'fiber',
    }
  if (see === 0)
    return dist === 1
      ? {
          title: 'Most radiowy 60 GHz',
          text: 'Szybkie łącze na setki metrów bez kopania. Mocny deszcz osłabia 60 GHz, dlatego dobre modele przełączają się wtedy na zapasowe 5 GHz.',
          icon: 'ant',
        }
      : {
          title: 'Most radiowy 5 GHz',
          text: 'Na dłuższe odcinki 5 GHz, na zewnątrz w paśmie dopuszczonym bez pozwolenia, z mechanizmem DFS.',
          icon: 'ant',
        }
  return {
    title: 'Trzeba znaleźć wyższy punkt',
    text: 'Most radiowy potrzebuje widoczności między antenami, bez drzew i dachów na trasie. Sprawdzamy, czy pomoże maszt albo punkt pośredni. Jeśli nie, szukamy innej trasy dla światłowodu, np. istniejącej rury albo linii napowietrznej.',
    icon: 'eye',
  }
}
