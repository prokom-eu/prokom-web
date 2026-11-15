/**
 * Towns with their own page `/obszar/<slug>` (ADR-I006): the line's area from Rabka-Zdrój up to
 * Kraków. Each page has its own text (`sites/instalacje/dane/miejscowosci.ts`) — a town is added
 * here only together with it (a test checks both lists). Kraków is one page: no district pages.
 */
export const AREA_TOWNS = [
  { slug: 'rabka-zdroj', name: 'Rabka-Zdrój' },
  { slug: 'nowy-targ', name: 'Nowy Targ' },
  { slug: 'zakopane', name: 'Zakopane' },
  { slug: 'jordanow', name: 'Jordanów' },
  { slug: 'mszana-dolna', name: 'Mszana Dolna' },
  { slug: 'lubien', name: 'Lubień' },
  { slug: 'pcim', name: 'Pcim' },
  { slug: 'myslenice', name: 'Myślenice' },
  { slug: 'dobczyce', name: 'Dobczyce' },
  { slug: 'krakow', name: 'Kraków' },
  { slug: 'wieliczka', name: 'Wieliczka' },
  { slug: 'skawina', name: 'Skawina' },
  { slug: 'limanowa', name: 'Limanowa' },
  { slug: 'poronin', name: 'Poronin' },
  { slug: 'bukowina-tatrzanska', name: 'Bukowina Tatrzańska' },
  { slug: 'bialka-tatrzanska', name: 'Białka Tatrzańska' },
  { slug: 'szczawnica', name: 'Szczawnica' },
] as const

export type AreaTown = (typeof AREA_TOWNS)[number]
export type AreaSlug = AreaTown['slug']

/** The list of towns (`/obszar`) and one town's page (`/obszar/nowy-targ`). */
export const AREA_PATH = '/obszar'
export const areaHref = (slug: string) => `${AREA_PATH}/${slug}`
