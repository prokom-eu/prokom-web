import type { CatalogCategory } from '../../payload-types'
import type { K3Dictionaries } from './k3'
import { categoryData, CATEGORY_SLUGS, RETIRED_CATEGORY_SLUGS } from './map'

/**
 * K4 categories (`seed/prokombiznes/k4/slowniki-k4.json`, D-K4-2, ADR-017): 29 categories in
 * 5 departments replace the 23 of K3 — "Komputery i monitory" splits into laptops, computers,
 * monitors, tablets and phones. Pure functions: `run.ts` only looks up ids and writes.
 */

// --- shapes of the package (only the keys the import reads) ---

export type K4Help = { t: string; d: string; b: string; a: string }
type K4SourceCategory = {
  kod: string
  dzial: string
  nazwa: string
  opis?: string | null
  podkategorie: { slug: string; nazwa: string }[]
  do_czego: string[] | null
  dobor: K4Help | null
}
export type K4SourceDictionaries = {
  dzialy: { slug: string; nazwa: string; kategorie: string[] }[]
  kategorie: K4SourceCategory[]
  do_czego_podkategorie: Record<string, string[]>
  dobor_podkategorie: Record<string, K4Help>
}

/** A K4 category in the K3 shape (`slug` = code), so the K3 import code reads it as before. */
export type K4Category = {
  slug: string
  nazwa: string
  grupa: string
  opis?: string | null
  kolejnosc: number
  do_czego: string[]
  dobor: K4Help | null
  podkategorie: { slug: string; nazwa: string; do_czego: string[]; dobor: K4Help | null }[]
}

function fail(message: string): never {
  throw new Error(`Seed (K4): ${message}`)
}

/**
 * K3 dictionaries with the K4 departments and categories: a group keeps its K3 icon and
 * gradient and takes the K4 name; categories come in the K4 order.
 */
export function k4Dictionaries<T extends Pick<K3Dictionaries, 'grupy'>>(
  k3: T,
  k4: K4SourceDictionaries,
): Omit<T, 'kategorie'> & { kategorie: K4Category[] } {
  const grupy = k4.dzialy.map((department, index) => {
    const group = k3.grupy.find((item) => item.slug === department.slug)
    if (!group) fail(`department "${department.slug}" has no K3 group.`)
    return { ...group, nazwa: department.nazwa, kolejnosc: index }
  })
  const kategorie = k4.kategorie.map((category, index): K4Category => {
    const department = k4.dzialy.find((item) => item.slug === category.dzial)
    if (!department?.kategorie.includes(category.kod)) {
      fail(`category "${category.kod}" in department "${category.dzial}" not listed there.`)
    }
    return {
      slug: category.kod,
      nazwa: category.nazwa,
      grupa: category.dzial,
      opis: category.opis,
      kolejnosc: index,
      do_czego: category.do_czego ?? [],
      dobor: category.dobor,
      podkategorie: category.podkategorie.map((row) => {
        const key = `${category.kod}/${row.slug}`
        return {
          slug: row.slug,
          nazwa: row.nazwa,
          do_czego: k4.do_czego_podkategorie[key] ?? [],
          dobor: k4.dobor_podkategorie[key] ?? null,
        }
      }),
    }
  })
  for (const department of k4.dzialy) {
    for (const code of department.kategorie) {
      if (!kategorie.some((category) => category.slug === code)) {
        fail(`department "${department.slug}" lists unknown category "${code}".`)
      }
    }
  }
  return { ...k3, grupy, kategorie }
}

/** Icons of the new categories; wagi, kody and vend have none (the group's icon, as in K3). */
export function k4CategoryIcons(k3: Record<string, string>): Record<string, string> {
  return {
    ...k3,
    laptopy: 'monitor',
    komputery: 'monitor',
    monitory: 'monitor',
    tablety: 'monitor',
    telefony: 'phone',
    'akcesoria-biuro': 'monitor',
    niszczarki: 'doc',
  }
}

const HELP_ACTIONS: Record<string, 'inquiry' | 'vending'> = {
  kontakt: 'inquiry',
  vending: 'vending',
}

type HelpData = NonNullable<CatalogCategory['help']>

function helpData(help: K4Help | null): HelpData {
  if (!help) return { title: null, text: null, button: null, action: null }
  return {
    title: help.t,
    text: help.d,
    button: help.b,
    action: HELP_ACTIONS[help.a] ?? fail(`unknown help action "${help.a}".`),
  }
}

/**
 * Categories whose subcategories have their own page (`/oferta/<kategoria>/<slug>`): ADR-012
 * rozstrz. 14 (serwery, ekrany) and the printers of K4 (ADR-017, uzupełnienie K4a-1). Elsewhere
 * a subcategory is a chip.
 */
export const K4_SUBCATEGORY_PAGES: ReadonlySet<string> = new Set(['serw', 'av', 'mfp'])

/**
 * Fields K4 owns; subcategory rows are rewritten whole. The help card of a category is not
 * written yet: its button and action reach the page only in K4d, and the vending text points to
 * a page K4j builds (the B10a texts of the cash registers stay as they are).
 */
/**
 * SEO titles of categories whose name is also the title of a page (audit 01.11.2026): the
 * category /oferta/automaty-vendingowe and the page /automaty-vendingowe were both
 * „Automaty vendingowe”.
 */
const K4_CATEGORY_TITLES: Readonly<Record<string, string>> = {
  'automaty-vendingowe': 'Automaty vendingowe — modele Optivendi',
}

export function k4CategoryData(
  category: K4Category,
  groupId: number,
  icons: Record<string, string>,
) {
  const base = categoryData(category, groupId, icons)
  const title = K4_CATEGORY_TITLES[base.slug]
  return {
    ...base,
    ...(title && { seo: { title } }),
    useCases: category.do_czego,
    subcategories: category.podkategorie.map((row) => ({
      name: row.nazwa,
      slug: K4_SUBCATEGORY_PAGES.has(category.slug) ? row.slug : null,
      useCases: row.do_czego,
      help: helpData(row.dobor),
    })),
  }
}

// --- cards ---

/** Category of a K3 / K3.1 card of "Komputery i monitory" by its subcategory. */
const K3_COMPUTER_CATEGORIES: Record<string, string> = {
  laptopy: 'laptopy',
  komputery: 'komputery',
  monitory: 'monitory',
  'stacje-robocze': 'komputery',
  'stacje-dokujace': 'komputery',
}

type Placeable = { slug_seed: string; kategoria: string; podkategoria?: string | null }

/**
 * Category and subcategory of a card in K4: the K4 card's (by `slug_seed`), else — cards of
 * the K3.1 split that K4 leaves out — the K3 one moved by `K3_COMPUTER_CATEGORIES`. A
 * subcategory equal to the category (`laptopy/laptopy`) is none; one the dictionary lacks is
 * reported and left out (no chip without a row in the category).
 */
export function k4CardPlacement(
  card: Placeable,
  k4Cards: ReadonlyMap<string, Omit<Placeable, 'slug_seed'>>,
  categories: K4Category[],
): { kategoria: string; podkategoria: string | null; unknownSubcategory: string | null } {
  const source = k4Cards.get(card.slug_seed) ?? card
  const sub = source.podkategoria?.trim() || null
  const kategoria =
    source.kategoria === 'komp' ? (K3_COMPUTER_CATEGORIES[sub ?? ''] ?? '') : source.kategoria
  const category = categories.find((item) => item.slug === kategoria)
  if (!category) {
    fail(
      `category "${source.kategoria}" (subcategory "${sub ?? ''}") of "${card.slug_seed}" unknown.`,
    )
  }
  if (!sub || sub === kategoria) return { kategoria, podkategoria: null, unknownSubcategory: null }
  const row = category.podkategorie.find((item) => item.slug === sub || item.nazwa === sub)
  return row
    ? { kategoria, podkategoria: row.slug, unknownSubcategory: null }
    : { kategoria, podkategoria: null, unknownSubcategory: `${kategoria}/${sub}` }
}

// --- 301 from K3 addresses ---

/**
 * Rules for the addresses K4 retires: a K3 category without a K4 code → `/oferta`, its
 * subcategory pages → the category that took them; a subcategory page the category no longer
 * has → the category.
 */
export function k4CategoryRedirects(
  k3Categories: { slug: string; podkategorie?: { slug?: string | null }[] | null }[],
  categories: K4Category[],
  withPages: ReadonlySet<string>,
): { from: string; to: string }[] {
  const hasPage = (category: K4Category | undefined, slug: string) =>
    !!category &&
    K4_SUBCATEGORY_PAGES.has(category.slug) &&
    category.podkategorie.some((item) => item.slug === slug)
  const rules: { from: string; to: string }[] = []
  for (const old of k3Categories) {
    const current = categories.find((item) => item.slug === old.slug)
    const oldSlug = current ? CATEGORY_SLUGS[old.slug] : RETIRED_CATEGORY_SLUGS[old.slug]
    if (!oldSlug) fail(`K3 category "${old.slug}" has no address.`)
    if (!current) rules.push({ from: `/oferta/${oldSlug}`, to: '/oferta' })
    if (!withPages.has(old.slug)) continue
    for (const row of old.podkategorie ?? []) {
      if (!row.slug) continue
      if (hasPage(current, row.slug)) continue
      const target = current ? old.slug : K3_COMPUTER_CATEGORIES[row.slug]
      rules.push({
        from: `/oferta/${oldSlug}/${row.slug}`,
        to: target ? `/oferta/${CATEGORY_SLUGS[target]}` : '/oferta',
      })
    }
  }
  return rules
}

/**
 * Is a 301 target an address K4 retired (`/oferta/komputery-monitory…`)? The import rewrites
 * such a rule (written by an earlier import) instead of keeping it as a panel change.
 */
export function isRetiredTarget(to: string): boolean {
  return Object.values(RETIRED_CATEGORY_SLUGS).some(
    (slug) => to === `/oferta/${slug}` || to.startsWith(`/oferta/${slug}/`),
  )
}
