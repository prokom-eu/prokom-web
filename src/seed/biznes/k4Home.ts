import path from 'node:path'

import { isIconName, type FeaturedGroup, type IconName } from '../../lib/catalog/options'
import { K4_MEDIA_DIR } from './k4Catalog'
import type { ProductId } from './k31Plans'

/**
 * K4a-2: lists of `strona-glowna-k4.json` (K4-FINAL §4.1) — „O to firmy pytają najczęściej”,
 * the order inside a category (`pop9`), the department's first cards (`dzTop9`) and the products
 * of the homepage wheel. Pure functions; `run.ts` gives them the record ids.
 */

export type K4HomeFile = {
  kolejnosc_w_kategorii: Record<string, number>
  top_dzialu: Record<string, string[]>
  /**
   * KOLO-HERO v3 (03.11): the products of each department on the wheel, in order; `nazwy` = the
   * short names of the tooltip, `kolory` = a colour the card opens with, `krotka` = the short
   * label of the department, `link` = one extra bubble for a page (Opieka IT).
   */
  kolo_hero: {
    g: string
    p: string[]
    nazwy?: Partial<Record<string, string>>
    kolory?: Partial<Record<string, string>>
    krotka?: string
    link?: { n: string; href: string; ic: string }
  }[]
}

/** `niepodzielone` of `mapa-slugow-k4.json`: a card the repo split → its new cards. */
export type K4Splits = Record<string, { nowe: string[] }>

/**
 * The 16 of K35 §7a („O to firmy pytają najczęściej — 16 pozycji z filtrem”, v150). The package
 * file still has the old 8 (`najczesciej_wybierane`), so the list and its pills live here,
 * slugs checked against `katalog-k4.json` (ADR-017 „Doprecyzowania K4a-2”).
 */
export const K4_FEATURED: readonly { slug: string; group: FeaturedGroup }[] = [
  { slug: 'ergo', group: 'kasy-platnosci' },
  { slug: 'k10', group: 'kasy-platnosci' },
  { slug: 'd3', group: 'kasy-platnosci' },
  { slug: 'v3mix', group: 'kasy-platnosci' },
  { slug: 'pol', group: 'kasy-platnosci' },
  { slug: 'lenovo-thinkbook-14-g8-g9', group: 'komputery-telefony' },
  { slug: 'lenovo-thinkcentre-neo-50s-55s', group: 'komputery-telefony' },
  { slug: 'dell-pro-14-16', group: 'komputery-telefony' },
  { slug: 'apple-macbook-air-m5', group: 'komputery-telefony' },
  { slug: 'apple-iphone-17', group: 'komputery-telefony' },
  { slug: 'nexo', group: 'programy-ochrona' },
  { slug: 'microsoft-365-business', group: 'programy-ochrona' },
  { slug: 'eset', group: 'programy-ochrona' },
  { slug: 'euro', group: 'programy-ochrona' },
  { slug: 'apc-back-ups', group: 'zasilanie' },
  { slug: 'comex-cover-core-one', group: 'zasilanie' },
]

const fail = (message: string): never => {
  throw new Error(`Seed (K4 strona główna): ${message}`)
}

/** `pop9` by card: a card the repo split gives its place to each of its new cards. */
export function k4CategoryOrder(home: K4HomeFile, splits: K4Splits): Map<string, number> {
  const order = new Map<string, number>()
  for (const [slug, place] of Object.entries(home.kolejnosc_w_kategorii)) {
    for (const card of splits[slug]?.nowe ?? [slug]) {
      if (!order.has(card)) order.set(card, place)
    }
  }
  return order
}

/** Fields of a card the K4 lists set: its pill among the 16 and its place in the category. */
export function k4HomeProductFields(slug: string, categoryOrder: ReadonlyMap<string, number>) {
  return {
    featuredGroup: K4_FEATURED.find((item) => item.slug === slug)?.group ?? null,
    categoryOrder: categoryOrder.get(slug) ?? null,
  }
}

/** `CatalogGroups` by department slug: first cards under „Polecane” and the wheel. */
export function k4GroupProducts(home: K4HomeFile, product: ProductId) {
  const ids = (slugs: string[], where: string) =>
    slugs.map((slug) => product(slug) ?? fail(`${where}: card "${slug}" has no record.`))
  const departments = new Set([
    ...Object.keys(home.top_dzialu),
    ...home.kolo_hero.map((row) => row.g),
  ])
  return new Map(
    [...departments].map((group) => {
      const wheel = home.kolo_hero.find((row) => row.g === group)
      const link = wheel?.link
      if (link && !isIconName(link.ic)) fail(`wheel of "${group}": unknown icon "${link.ic}".`)
      return [
        group,
        {
          topProducts: ids(home.top_dzialu[group] ?? [], `top of "${group}"`),
          wheelProducts: ids(wheel?.p ?? [], `wheel of "${group}"`),
          // null clears what an older package set.
          shortName: wheel?.krotka ?? null,
          wheelLink: link
            ? { label: link.n, href: link.href, icon: link.ic as IconName }
            : { label: null, href: null, icon: null },
        },
      ]
    }),
  )
}

/** Fields of each wheel card: its short name in the tooltip and the colour it opens with. */
export function k4WheelProducts(home: K4HomeFile) {
  return new Map(
    home.kolo_hero.flatMap((row) =>
      row.p.map((slug) => [
        slug,
        {
          wheelName: row.nazwy?.[slug] ?? fail(`wheel of "${row.g}": "${slug}" has no name.`),
          wheelColor: row.kolory?.[slug] ?? null,
        },
      ]),
    ),
  )
}

/** Cut-out photo of a wheel card (paczka 03.11), uploaded as `k4-kolo-<slug>.webp`. */
export function k4WheelImageFile(slug: string) {
  return {
    filePath: path.join(K4_MEDIA_DIR, 'kolo', `kolo-${slug}.webp`),
    uploadName: `k4-kolo-${slug}.webp`,
  }
}
