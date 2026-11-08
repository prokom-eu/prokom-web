import type { PublicImage } from '@/lib/media/public'

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
  /**
   * Round v5: the photos, the cover first; never empty on the grid (runda v6 D2). Optional because
   * the filters get the cards without photos (smaller client payload).
   */
  photos?: PublicImage[]
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
