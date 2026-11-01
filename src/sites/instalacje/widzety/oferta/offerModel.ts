import type { InstIconName } from '../../icons'

/*
 * Logic of the full offer `/uslugi` (`zrodlo/pages/Oferta.js`, `page()`) as pure functions:
 * `offerModel.test.ts` runs the original and compares. The search: without Polish letters and
 * dashes, word stems and synonyms; the object filter by the solution's categories; three
 * solutions per area until „Pokaż wszystkie” (or any filter). The prototype's text fixes
 * (`FIX`, `AFIX`) are in the data since I12 (`seed/prokominstalacje/oferta-76.json`).
 */

export type OfferCategory = 'dom' | 'apt' | 'pens' | 'rest' | 'sklep' | 'firma' | 'inst' | 'dev'

/** The object chips (`OB` of the prototype) with their icons. */
export const OFFER_OBJECTS: { key: OfferCategory; label: string; icon: InstIconName }[] = [
  { key: 'dom', label: 'Dom', icon: 'home' },
  { key: 'apt', label: 'Apartament', icon: 'key' },
  { key: 'pens', label: 'Pensjonat i hotel', icon: 'bed' },
  { key: 'rest', label: 'Restauracja', icon: 'food' },
  { key: 'sklep', label: 'Sklep', icon: 'shop' },
  { key: 'firma', label: 'Firma i hala', icon: 'factory' },
  { key: 'inst', label: 'Kościół, szkoła, gmina', icon: 'church' },
  { key: 'dev', label: 'Deweloper', icon: 'crane' },
]

const OBJECT_LABEL = Object.fromEntries(OFFER_OBJECTS.map((o) => [o.key, o.label])) as Record<
  OfferCategory,
  string
>

export type OfferSolution = { name: string; description: string; categories: OfferCategory[] }

export type OfferArea = {
  key: string
  name: string
  icon: InstIconName | null
  href: string | null
  family: string
  description: string
  brands: string[]
  solutions: OfferSolution[]
}

export type OfferState = { q: string; o: OfferCategory | ''; open: Record<string, boolean> }

export const INITIAL_OFFER: OfferState = { q: '', o: '', open: {} }

/** Solutions shown per area before „Pokaż wszystkie” (`LIM`). */
const LIMIT = 3

/** `norm` of the prototype's search: no Polish letters, dashes and slashes, single spaces. */
export function offerNorm(text: string): string {
  const letters: Record<string, string> = {
    ą: 'a',
    ć: 'c',
    ę: 'e',
    ł: 'l',
    ń: 'n',
    ó: 'o',
    ś: 's',
    ź: 'z',
    ż: 'z',
  }
  return (text || '')
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => letters[ch] ?? ch)
    .replace(/[-‐–/]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const SYNONYMS: Record<string, string[]> = {
  wifi: ['wifi', 'siec', 'internet'],
  internet: ['internet', 'wifi', 'siec', 'lacze'],
  siec: ['siec', 'wifi'],
  kamera: ['kamer', 'monitoring'],
  kamery: ['kamer', 'monitoring'],
  monitoring: ['monitoring', 'kamer'],
  cctv: ['monitoring', 'kamer'],
  alarm: ['alarm', 'czujk'],
  domofon: ['domofon', 'wideodomofon'],
  zamek: ['zamk', 'zamek', 'kod'],
  tv: ['tv', 'telewiz', 'anten'],
  telewizja: ['telewiz', 'anten'],
  ekran: ['ekran', 'monitor'],
  muzyka: ['muzyk', 'naglosn'],
  glosniki: ['glosnik', 'naglosn'],
  ladowarka: ['ladowar'],
  smart: ['smart', 'ampio'],
}

/** A rough stem: long words lose two letters, five-letter ones keep four (typos at the end). */
const stem = (word: string) =>
  word.length > 5 ? word.slice(0, word.length - 2) : word.length > 4 ? word.slice(0, 4) : word

export type OfferAreaView = {
  id: string
  key: string
  name: string
  icon: InstIconName | null
  href: string | null
  family: string
  description: string
  brands: string[]
  items: { name: string; description: string; tags: string[] }[]
  /** Solutions matching the filters (the navigation count). */
  count: number
  /** „Pokaż wszystkie (n)” shown. */
  more: boolean
  /** „Zwiń” shown. */
  less: boolean
  hidden: boolean
  extra: boolean
}

/** Everything the offer list shows for the state. */
export function offerView(areas: readonly OfferArea[], state: OfferState) {
  const words = offerNorm(state.q)
    .split(' ')
    .filter((w) => w.length > 1)
  const q = words.join(' ')
  const o = state.o
  const match = (hay: string) =>
    words.every((w) => (SYNONYMS[w] ?? [stem(w)]).some((x) => hay.includes(x)))
  const filtered = Boolean(q || o)
  let total = 0
  let shown = 0
  const views: OfferAreaView[] = areas.map((a) => {
    const hay = offerNorm(`${a.name} ${a.description} ${a.brands.join(' ')}`)
    const all = a.solutions
      .filter((s) => {
        total += 1
        const okO = !o || s.categories.includes(o)
        const okQ = !q || match(`${offerNorm(`${s.name} ${s.description}`)} ${hay}`)
        return okO && okQ
      })
      .map((s) => ({
        name: s.name,
        description: s.description,
        tags:
          s.categories.length >= 7 ? ['każdy obiekt'] : s.categories.map((c) => OBJECT_LABEL[c]),
      }))
    shown += all.length
    const open = filtered || Boolean(state.open[a.key])
    const more = !open && all.length > LIMIT
    return {
      id: `o-${a.key}`,
      key: a.key,
      name: a.name,
      icon: a.icon,
      href: a.href,
      family: a.family,
      description: a.description,
      brands: a.brands,
      items: more ? all.slice(0, LIMIT) : all,
      count: all.length,
      more,
      less: Boolean(state.open[a.key]) && !filtered && all.length > LIMIT,
      hidden: all.length === 0,
      extra: a.key === 'ev',
    }
  })
  return { areas: views, total, shown, filtered, empty: shown === 0 }
}
