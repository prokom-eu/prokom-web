/*
 * Logic of `/realizacje` (`zrodlo/pages/Realizacje.js`, `page()`) as pure functions:
 * `realizacjeModel.test.ts` runs the original and compares. Two filters (installation, object),
 * six cards until „Pokaż wszystkie”. The data are the published realizations of the panel.
 */

export type RealizationItem = {
  id: number
  title: string
  category: string | null
  place: string | null
  scope: string | null
  description: string | null
  year: number | null
  services: string[]
  kind: string | null
}

export type RealizationsState = { fs: string; fo: string; more: boolean }

export const INITIAL_REALIZATIONS: RealizationsState = { fs: 'all', fo: 'all', more: false }

/** Installation filters (`FS`). */
export const SERVICE_FILTERS = [
  { key: 'all', label: 'Wszystkie' },
  { key: 'snd', label: 'Nagłośnienie' },
  { key: 'scr', label: 'Multimedia i projekcja' },
  { key: 'wifi', label: 'Sieci' },
  { key: 'ant', label: 'Anteny' },
] as const

/** Object filters (`FO`). */
export const KIND_FILTERS = [
  { key: 'all', label: 'Każdy obiekt' },
  { key: 'firma', label: 'Firmy' },
  { key: 'kosciol', label: 'Kościoły' },
  { key: 'gastro', label: 'Gastronomia' },
  { key: 'sklep', label: 'Sklepy i usługi' },
  { key: 'szkola', label: 'Szkoły' },
  { key: 'dom', label: 'Domy' },
] as const

/** Cards shown before „Pokaż wszystkie”. */
const LIMIT = 6

/** The prototype's line art of a card (`A`), picked from the object and the services. */
export const REALIZATION_ART = {
  snd: 'M30 120v-40h28l34-26v92l-34-26zM120 70a40 40 0 0 1 0 60M145 50a70 70 0 0 1 0 100M170 30a100 100 0 0 1 0 140',
  ch: 'M120 30v26M108 42h24M70 160V96l50-40 50 40v64M106 160v-34h28v34M30 160h180',
  cf: 'M50 80h100v44a36 36 0 0 1-36 36H86a36 36 0 0 1-36-36zM150 92h16a18 18 0 0 1 0 36h-16M80 40c-8 10 8 18 0 28M110 40c-8 10 8 18 0 28',
  prj: 'M30 60h130v60H30zM160 75l60-30v90l-60-30M60 120l-10 40M130 120l10 40M95 90a14 14 0 1 0 .1 0',
  school: 'M120 30L20 80l100 50 100-50zM60 100v40c30 25 90 25 120 0v-40',
  dish: 'M40 70a90 90 0 0 0 100 100zM80 130l60-60M160 50a12 12 0 1 0 .1 0M70 180h90',
} as const

/** The art of a card: as the prototype drew its eleven realizations, from what the panel has. */
export function realizationArt(item: Pick<RealizationItem, 'kind' | 'services'>): string {
  const screens = item.services.includes('scr')
  switch (item.kind) {
    case 'kosciol':
      return REALIZATION_ART.ch
    case 'szkola':
      return REALIZATION_ART.school
    case 'dom':
      return REALIZATION_ART.dish
    case 'gastro':
      return screens ? REALIZATION_ART.cf : REALIZATION_ART.snd
    case 'sklep':
      return item.services.includes('snd') ? REALIZATION_ART.snd : REALIZATION_ART.prj
    default:
      return screens ? REALIZATION_ART.prj : REALIZATION_ART.snd
  }
}

/** Everything the page shows for the state. */
export function realizationsView(items: readonly RealizationItem[], state: RealizationsState) {
  const list = items.filter(
    (r) =>
      (state.fs === 'all' || r.services.includes(state.fs)) &&
      (state.fo === 'all' || r.kind === state.fo),
  )
  return {
    serviceFilters: SERVICE_FILTERS.map((f) => ({
      ...f,
      count:
        f.key === 'all' ? items.length : items.filter((r) => r.services.includes(f.key)).length,
      on: state.fs === f.key,
    })),
    kindFilters: KIND_FILTERS.map((f) => ({ ...f, on: state.fo === f.key })),
    list: list.map((r, index) => ({ ...r, hidden: !state.more && index >= LIMIT })),
    empty: list.length === 0,
    moreOn: list.length > LIMIT,
    moreLabel: state.more ? 'Zwiń listę' : `Pokaż wszystkie (${list.length})`,
  }
}
