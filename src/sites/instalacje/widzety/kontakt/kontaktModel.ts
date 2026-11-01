import { CONSENT_CLAUSE } from '@/lib/inquiry/consent'
import { sourceFromHref } from '@/lib/inquiry/form'
import { HONEYPOT_FIELD } from '@/lib/inquiry/honeypot'
import { norm } from '@/lib/instalacje/plan'

import { kontakt as K } from '../../dane/kontakt'

/*
 * Logic of the contact page (`zrodlo/pages/Kontakt.js`, `page()`) as pure functions:
 * `kontaktModel.test.ts` runs the original and compares. The map: a typed town → its zone, the
 * route from the nearest salon, the town marks. The form: errors in the order of the fields and
 * the request body. Differences on purpose: the name is required (the inquiry needs it), the
 * zone texts without the prototype's `[SZEF…]` notes.
 */

export type ZoneKey = 'r' | 'z' | 'p' | 'm'

/** Map position of a point (`pr(lat, lon)`). */
const pr = (lat: number, lon: number): [number, number] => [
  Math.round((lon - 19.55) * 500 + 20),
  Math.round((49.92 - lat) * 750 + 20),
]

/** Towns on the map (`T`): name, latitude, longitude, zone, salon. */
const TOWNS: [string, number, number, ZoneKey, boolean][] = [
  ['Rabka-Zdrój', 49.61, 19.96, 'r', true],
  ['Zakopane', 49.3, 19.95, 'z', true],
  ['Nowy Targ', 49.48, 20.03, 'p', false],
  ['Jordanów', 49.65, 19.83, 'r', false],
  ['Mszana Dolna', 49.68, 20.08, 'r', false],
  ['Chabówka', 49.59, 19.92, 'r', false],
  ['Limanowa', 49.7, 20.42, 'm', false],
  ['Szczawnica', 49.43, 20.49, 'p', false],
  ['Krościenko', 49.44, 20.43, 'p', false],
  ['Czarny Dunajec', 49.44, 19.85, 'p', false],
  ['Białka Tatrzańska', 49.39, 20.1, 'z', false],
  ['Bukowina Tatrzańska', 49.34, 20.11, 'z', false],
  ['Poronin', 49.34, 20.0, 'z', false],
  ['Kościelisko', 49.29, 19.89, 'z', false],
  ['Maków Podhalański', 49.73, 19.68, 'm', false],
  ['Myślenice', 49.83, 19.94, 'm', false],
  ['Nowy Sącz', 49.62, 20.69, 'm', false],
]
const SALONS: [string, number, number][] = [
  ['Rabka-Zdrój', 49.61, 19.96],
  ['Zakopane', 49.3, 19.95],
]
const LEFT = [
  'Chabówka',
  'Kościelisko',
  'Czarny Dunajec',
  'Krościenko',
  'Poronin',
  'Nowy Sącz',
  'Jordanów',
]
const MINOR = [
  'Chabówka',
  'Kościelisko',
  'Poronin',
  'Bukowina Tatrzańska',
  'Krościenko',
  'Maków Podhalański',
]

/** The zone of a town not on the map (the planner's patterns, `zoneKey`). */
function zoneKey(t: string): ZoneKey {
  if (/rabk|chabow|jordan|mszan|raba|spytk|lubien|skomiel|niedzwi|ponic|olszow/.test(t)) return 'r'
  if (/zakop|poron|koscieli|bukow|bialk|bialy dun|murzas/.test(t)) return 'z'
  if (/nowy targ|nowy tar|szaflar|czarny dun|jablon|czorszt|szczawn|kroscien|orawa|spisz/.test(t)) {
    return 'p'
  }
  return 'm'
}

export type MapTown = {
  name: string
  x: number
  y: number
  r: number
  tx: number
  ty: number
  /** Label to the right (`fo-l`) or to the left (`fo-r`) of the point. */
  side: 'fo-l' | 'fo-r'
  cls: string
}

/** Everything the map and its result line show for the typed text (`kt`). */
export function mapView(query: string) {
  const q = norm(query)
  const hit =
    q.length > 2 ? TOWNS.find((t) => norm(t[0]).startsWith(q) || norm(t[0]).includes(q)) : null
  let zone: ZoneKey | '' = hit ? hit[3] : ''
  if (!hit && q.length > 2) zone = zoneKey(q)

  const towns: MapTown[] = TOWNS.map(([name, lat, lon, , salon]) => {
    const [x, y] = pr(lat, lon)
    const left = LEFT.includes(name)
    const on = hit?.[0] === name
    return {
      name,
      x,
      y,
      r: salon ? 4 : on ? 6 : 4,
      tx: x + (left ? -9 : salon ? 14 : 8),
      ty: y - (salon ? 25 : 3) + (name === 'Chabówka' ? 8 : 0),
      side: left ? 'fo-r' : 'fo-l',
      cls:
        'ktg2' +
        (salon ? ' hq' : '') +
        (MINOR.includes(name) ? ' mn' : '') +
        (name === 'Poronin' ? ' nl' : '') +
        (on ? ' on' : ''),
    }
  })
  const pins = SALONS.map(([, lat, lon]) => {
    const [x, y] = pr(lat, lon)
    return `translate(${x} ${y})`
  })

  let route = ''
  let near: { name: string; d: number } | null = null
  if (hit) {
    const hp = pr(hit[1], hit[2])
    const nearest = SALONS.map(([name, lat, lon]) => {
      const p = pr(lat, lon)
      return { name, p, d: Math.hypot((p[0] - hp[0]) * 0.1448, (p[1] - hp[1]) * 0.1483) }
    }).sort((a, b) => a.d - b.d)[0]!
    near = { name: nearest.name, d: nearest.d }
    if (nearest.d > 1) {
      const [sx, sy] = nearest.p
      const mx = (sx + hp[0]) / 2
      const my = (sy + hp[1]) / 2
      const dx = hp[0] - sx
      const dy = hp[1] - sy
      route = `M${sx} ${sy - 2} Q${Math.round(mx - dy * 0.18)} ${Math.round(my + dx * 0.18)} ${hp[0]} ${hp[1]}`
    }
  }

  const title = zone ? K.zones[zone].name : K.map.empty
  const text = zone
    ? (hit
        ? hit[0] + (near && near.d > 1 ? ` · najbliżej z salonu: ${near.name}` : '') + '. '
        : '') + K.zones[zone].text
    : K.map.emptyText
  const zoneClass = (key: Exclude<ZoneKey, 'm'>) => 'kz2' + (zone === key ? ' on' : '')
  return {
    zone,
    town: hit ? hit[0] : null,
    towns,
    pins,
    route,
    title,
    text,
    zoneClass: { p: zoneClass('p'), r: zoneClass('r'), z: zoneClass('z') },
  }
}

// ── The form (`#napisz`) ─────────────────────────────────────────────────────────────────

export type ContactState = {
  topic: number
  name: string
  phone: string
  message: string
  consent: boolean
}

export const INITIAL_CONTACT: ContactState = {
  topic: 0,
  name: '',
  phone: '',
  message: '',
  consent: false,
}

export type ContactError = 'name' | 'phone' | 'consent'

const digits = (phone: string) => phone.replace(/\D/g, '').length

/** The first missing answer (`send`): name, phone of 9 digits, consent. */
export function contactError(s: ContactState): ContactError | null {
  if (!s.name.trim()) return 'name'
  if (digits(s.phone) < 9) return 'phone'
  if (!s.consent) return 'consent'
  return null
}

/**
 * Body of `POST /api/inquiry`: a contact inquiry „Instalacje — kontakt”. The topic is not a
 * service, so it opens the message (a contact needs one even when the visitor wrote nothing).
 */
export function contactBody(
  s: ContactState,
  { href, formToken, website }: { href: string; formToken: string; website: string },
) {
  const topic = K.form.topics[s.topic] ?? K.form.topics[0]!
  const text = s.message.trim()
  return {
    type: 'contact' as const,
    category: K.form.category,
    source: sourceFromHref(href),
    name: s.name.trim(),
    phone: s.phone.trim(),
    message: [`Sprawa: ${topic}`, text].filter(Boolean).join('\n'),
    consent: { accepted: s.consent, clauseVersion: CONSENT_CLAUSE.version },
    [HONEYPOT_FIELD]: website,
    formToken,
  }
}
