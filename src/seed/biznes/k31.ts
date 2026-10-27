import type { Product } from '../../payload-types'
import { productLegacyIds, type SeedProduct } from './map'
import {
  matchCards,
  productSlug,
  type K3Card,
  type K3Dictionaries,
  type K3Gallery,
  type K3Source,
  type RetiredProduct,
} from './k3'

/**
 * K3.1 package `seed/prokombiznes/k31/` on top of K3 (K31-ZMIANY §1–2, §7, §13.3, §13.5–13.6;
 * ADR-012 rozstrz. 15–18). Pure functions: K3.1 turns into the same list of cards K3 has
 * (new cards, content supplements, split cards), so `run.ts` imports it with the K3 rules.
 */

// --- shapes of the package (only the keys the import reads) ---

/**
 * A K3.1 card: K3 format + its series; split cards remember the card they came from and which
 * of its films they show (`filmy`).
 */
export type K31Card = K3Card & {
  seria?: string | null
  zrodlo_podzialu?: string
  filmy?: string[]
}

export type K31Supplement = {
  opis?: string[] | null
  faq?: { q: string; a: string }[] | null
  parametry_dodaj?: { k: string; v: string; przed?: string | null }[] | null
  zrodla_dodaj?: K3Source[] | null
}

/** `karty-podzial-k31.json` → `karty`: one multi-model card and the cards it becomes. */
export type K31Split = {
  z: string
  redirect_301: string
  nowe: { slug: string; nazwa: string; warianty: string[]; klucz_modelu: string }[]
}

/** `karty-podzial-tresci.json` → `karty`: content of a split card, from its source only. */
export type K31SplitContent = Pick<
  K3Card,
  'nazwa' | 'podtytul' | 'korzysc' | 'cechy' | 'opis' | 'parametry' | 'warianty_opis' | 'faq'
> & {
  slug: string
  z: string
  konfigurator: NonNullable<K3Card['konfigurator']>
  dobierz?: string[]
  /** Addresses from the source card's `zrodla`; all of them when missing. */
  zrodla?: string[]
  /** Files of the source card's gallery; empty = placeholder (K31-ZMIANY §4.10). */
  zdjecia: string[]
  /** YouTube ids of the source card's films that show this model or the whole series. */
  filmy: string[]
  uwagi: string
}

export type K31Video = {
  youtube_id: string
  tytul: string
  kanal?: string | null
  jezyk?: string | null
  dopasowanie: string
}

export type K31Input = {
  k3Cards: K3Card[]
  newCards: K31Card[]
  supplements: Record<string, K31Supplement>
  splits: K31Split[]
  splitContents: K31SplitContent[]
}

export type K31Catalog = {
  cards: K31Card[]
  /** Split cards and the card each came from (it leaves the list). */
  splits: { source: K31Card; split: K31Split }[]
}

const fail = (message: string): never => {
  throw new Error(`Seed (K3.1): ${message}`)
}

// --- catalog: K3 + new cards, supplements, splits ---

/**
 * Content supplements (§13.6): FAQ added (a question already on the card is skipped), the
 * description replaced, parameters inserted before `przed` (or at the end), sources added.
 */
export function withSupplement<T extends K3Card>(card: T, supplement: K31Supplement): T {
  const faq = [...(card.faq ?? [])]
  for (const item of supplement.faq ?? []) {
    if (!faq.some((existing) => existing.q === item.q)) faq.push(item)
  }
  const parametry = [...card.parametry]
  for (const { k, v, przed } of supplement.parametry_dodaj ?? []) {
    if (parametry.some((item) => item.k === k)) {
      fail(`card "${card.slug_seed}" already has the parameter "${k}".`)
    }
    const at = przed ? parametry.findIndex((item) => item.k === przed) : -1
    parametry.splice(at >= 0 ? at : parametry.length, 0, { k, v })
  }
  const urls = new Set(card.zrodla.map((item) => item.url))
  const zrodla = [
    ...card.zrodla,
    ...(supplement.zrodla_dodaj ?? []).filter((item) => !urls.has(item.url)),
  ]
  return {
    ...card,
    opis: supplement.opis?.length ? supplement.opis : card.opis,
    faq,
    parametry,
    zrodla,
  }
}

/**
 * Cards of one split (§13.5): content from `karty-podzial-tresci.json`, the rest from the
 * source. A new card with the source's address keeps its record (same keys); the others are
 * new records. Status always „do sprawdzenia” (noindex until Krystian accepts them).
 */
export function splitCards(
  source: K31Card,
  split: K31Split,
  contents: K31SplitContent[],
): K31Card[] {
  return split.nowe.map((target) => {
    const content =
      contents.find((item) => item.slug === target.slug) ??
      fail(`no content for split card "${target.slug}".`)
    if (content.z !== split.z) fail(`content of "${target.slug}" comes from "${content.z}".`)
    const sameRecord = target.slug === source.slug_seed
    const zrodla = content.zrodla
      ? content.zrodla.map(
          (url) =>
            source.zrodla.find((item) => item.url === url) ??
            fail(`source "${url}" of "${target.slug}" is not on "${split.z}".`),
        )
      : source.zrodla
    return {
      slug_seed: target.slug,
      legacyIds: sameRecord ? source.legacyIds : null,
      nazwa_poprzednia: sameRecord ? source.nazwa_poprzednia : null,
      kategoria: source.kategoria,
      podkategoria: source.podkategoria,
      marka: source.marka,
      seria: source.seria,
      nazwa: content.nazwa,
      podtytul: content.podtytul,
      korzysc: content.korzysc,
      cechy: content.cechy,
      opis: content.opis,
      parametry: content.parametry,
      warianty_opis: content.warianty_opis,
      konfigurator: content.konfigurator,
      faq: content.faq,
      pakiety: null,
      dobierz: content.dobierz ?? source.dobierz,
      branze: source.branze,
      zrodla,
      status: 'do-sprawdzenia',
      uwagi: [`Podział K3.1 z karty „${source.nazwa}” (${split.z}).`, content.uwagi, source.uwagi]
        .filter(Boolean)
        .join(' | '),
      zrodlo_podzialu: split.z,
      filmy: content.filmy,
    }
  })
}

/** All cards after K3.1: K3 + 26 new ones, supplements applied, 6 multi-model cards split. */
export function k31Catalog(input: K31Input): K31Catalog {
  const all: K31Card[] = [...input.k3Cards, ...input.newCards]
  const seen = new Set<string>()
  for (const card of all) {
    if (seen.has(card.slug_seed)) fail(`card "${card.slug_seed}" is in K3 and K3.1.`)
    seen.add(card.slug_seed)
  }
  for (const slug of Object.keys(input.supplements)) {
    if (!seen.has(slug)) fail(`supplement for unknown card "${slug}".`)
  }
  let cards = all.map((card) => {
    const supplement = input.supplements[card.slug_seed]
    return supplement ? withSupplement(card, supplement) : card
  })
  const splits: K31Catalog['splits'] = []
  for (const split of input.splits) {
    const source =
      cards.find((card) => card.slug_seed === split.z) ?? fail(`split of unknown "${split.z}".`)
    if (!split.nowe.some((target) => target.slug === split.redirect_301)) {
      fail(`301 of "${split.z}" points outside its split cards.`)
    }
    const parts = splitCards(source, split, input.splitContents)
    cards = cards.flatMap((card) => (card === source ? parts : [card]))
    splits.push({ source, split })
  }
  return { cards, splits }
}

// --- dictionaries ---

/** New subcategories of K3.1 (§5): name by address, in the category of the cards. */
const K31_SUBCATEGORIES: Record<string, { slug: string; nazwa: string }[]> = {
  komp: [
    { slug: 'stacje-robocze', nazwa: 'Stacje robocze' },
    { slug: 'stacje-dokujace', nazwa: 'Stacje dokujące' },
  ],
  av: [{ slug: 'wideokonferencje', nazwa: 'Wideokonferencje' }],
}

/**
 * K3 dictionaries with the K3.1 subcategories and the homepage list „Najczęściej wybierane”
 * (`strona-glowna-k31.json`, §13.3) in place of the K3 order of featured cards.
 */
export function k31Dictionaries<
  T extends Pick<K3Dictionaries, 'kategorie' | 'kolejnosc_wyroznionych'>,
>(dictionaries: T, featured: string[]): T {
  for (const code of Object.keys(K31_SUBCATEGORIES)) {
    if (!dictionaries.kategorie.some((category) => category.slug === code)) {
      fail(`category "${code}" missing in the dictionaries.`)
    }
  }
  return {
    ...dictionaries,
    kategorie: dictionaries.kategorie.map((category) => {
      const added = (K31_SUBCATEGORIES[category.slug] ?? []).filter(
        (row) => !category.podkategorie?.some((item) => item.slug === row.slug),
      )
      return added.length
        ? { ...category, podkategorie: [...(category.podkategorie ?? []), ...added] }
        : category
    }),
    kolejnosc_wyroznionych: featured,
  }
}

// --- galleries ---

/**
 * K3 galleries + K3.1 photos (`media-k31.json`) + split cards: the files their content names
 * (`zdjecia`), from the source card's folder. A split card without files gets no entry — the
 * placeholder (§4.10).
 */
export function k31Gallery(
  k3: K3Gallery,
  k31: K3Gallery,
  catalog: K31Catalog,
  contents: K31SplitContent[],
): K3Gallery {
  const gallery: K3Gallery = { ...k3 }
  for (const [slug, entry] of Object.entries(k31)) gallery[slug] = { ...entry, pakiet: 'k31' }
  for (const { source, split } of catalog.splits) {
    const from = gallery[source.slug_seed]
    delete gallery[source.slug_seed]
    for (const target of split.nowe) {
      const files = contents.find((item) => item.slug === target.slug)?.zdjecia ?? []
      if (!files.length) continue
      if (!from) return fail(`split card "${target.slug}" names photos, "${split.z}" has none.`)
      for (const file of files) {
        if (!from.pliki.includes(file)) fail(`photo "${file}" is not in "${split.z}".`)
      }
      gallery[target.slug] = { ...from, pliki: files, katalog: from.katalog ?? source.slug_seed }
    }
  }
  return gallery
}

// --- series and films ---

const VIDEO_MATCH: Record<string, NonNullable<Product['videos']>[number]['match']> = {
  model: 'model',
  seria: 'series',
  marka: 'brand',
}

/** Films of a split card: those its content names, from the source card. */
function splitFilms(card: K31Card, source: string, videos: Record<string, K31Video[]>) {
  const all = videos[source] ?? []
  return (card.filmy ?? []).map((id) => {
    const film =
      all.find((item) => item.youtube_id === id) ??
      fail(`film "${id}" of "${card.slug_seed}" is not on "${source}".`)
    // A film of one model of a multi-model card: on the split card it shows the series.
    return film.dopasowanie === 'model' ? { ...film, dopasowanie: 'seria' } : film
  })
}

/**
 * K3.1 fields of a product: its series (`seria_karty`, §5) and films (`wideo-k31.json`, §7).
 * A split card takes the series of its source and only the films its content names. A film
 * the weekly check switched off stays off — `active` is not in the package, it belongs to the
 * check and the panel (ADR-016).
 */
export function k31ProductFields(
  card: K31Card,
  series: Record<string, string>,
  videos: Record<string, K31Video[]>,
  stored: Pick<Product, 'videos'> | undefined,
) {
  const source = card.zrodlo_podzialu
  const inactive = new Set(
    (stored?.videos ?? []).filter((item) => item.active === false).map((item) => item.youtubeId),
  )
  const films = source ? splitFilms(card, source, videos) : (videos[card.slug_seed] ?? [])
  return {
    series: series[card.slug_seed] ?? (source ? series[source] : undefined) ?? null,
    videos: films.map((item) => ({
      youtubeId: item.youtube_id,
      title: item.tytul,
      channel: item.kanal?.trim() || null,
      lang: item.jezyk?.trim() || null,
      match: VIDEO_MATCH[item.dopasowanie] ?? fail(`unknown film match "${item.dopasowanie}".`),
      active: !inactive.has(item.youtube_id),
    })),
  }
}

// --- split cards: old record hidden, old address → 301 (§13.5, ADR-012 rozstrz. 17) ---

/**
 * Records of split cards that leave the catalog: the source card (found by its keys, like the
 * K3 import found it) is hidden and its address goes to the first new card. A source whose
 * address a new card keeps (Avtek TS 9 Mate G) stays as it is.
 */
export function k31Retired(catalog: K31Catalog, products: SeedProduct[]): RetiredProduct[] {
  const live = new Set(catalog.cards.map((card) => card.slug_seed))
  const matches = matchCards(
    catalog.splits.map(({ source }) => source),
    products,
  )
  return catalog.splits
    .filter(({ source }) => !live.has(source.slug_seed))
    .map(({ source, split }) => {
      const v2 = matches.get(source.slug_seed)
      // The address the K3 import gave the record.
      const address = productSlug(source, v2)
      return {
        legacyIds: [
          ...new Set([
            source.slug_seed,
            ...(source.legacyIds ?? []),
            ...(v2 ? productLegacyIds(v2) : []),
          ]),
        ],
        from: `/produkt/${address}`,
        to: `/produkt/${split.redirect_301}`,
        unpublish: true,
        reason: 'podzielona' as const,
      }
    })
}
