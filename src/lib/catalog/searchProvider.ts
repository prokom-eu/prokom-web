import { matchSupplySearch, type SupplySearchEntry } from '../biznes/procurement/links'
import { matchActions } from '../shared/search/palette'
import type { SearchGroup, SearchProvider, SearchResult } from '../shared/search/provider'
import {
  matchBrands,
  matchCategories,
  matchPages,
  prepareSearch,
  resultsLabel,
  searchProducts,
} from '../search'
import { brandHref, brandTarget } from './brand'
import { cardIcon, productHref } from './card'
import { categoryHref } from './category'
import type { CatalogIndex, IndexProduct } from './catalogIndex'
import { PLAN_PATH } from './floorPlan'
import { CONFIGURATOR_PATH } from './wizardEngine'

const MAX_PRODUCTS = 7
const MAX_CATEGORIES = 4
const MAX_PAGES = 3
const MAX_BRANDS = 3
const MAX_BUNDLES = 2

/** „Na skróty” of the empty search (K33 §2.5); categories missing from the catalog drop out. */
const SHORTCUT_CATEGORIES = [
  'kasy-fiskalne',
  'laptopy',
  'terminale-platnicze',
  'programy-sprzedazowe-erp',
  'siec-wifi',
  'serwery-nas-ups',
]

const PRODUCT_ID = 'p:'

const CONFIGURATOR: SearchResult = {
  id: 'konfigurator',
  title: 'Konfigurator',
  hint: 'Dobierzemy rozwiązanie w około minutę',
  href: CONFIGURATOR_PATH,
  icon: 'target',
}
/**
 * „Konfigurator” among the actions of plan §8.1 pkt 5, with its key words — matched like the
 * shared palette (whole words; a token of 3+ letters begins one).
 */
const CONFIGURATOR_WORDS = ['konfigurator', 'konfiguracja', 'dobierz', 'dobor', 'dobrac', 'wybor']
const asksForConfigurator = (q: string) =>
  matchActions([{ kind: 'primary', label: '', short: '', icon: '', words: CONFIGURATOR_WORDS }], q)
    .length > 0

const catalogSearch = (q: string): SearchResult => ({
  id: 'all',
  title: `Szukaj „${q}” w ofercie`,
  href: `/oferta?szukaj=${encodeURIComponent(q)}`,
  icon: 'search',
})

/**
 * Until the catalog index arrives (or after it failed): a phrase leads to the catalog's own
 * search — the dialog never says „nothing found” about products it has not seen yet.
 */
export const catalogLoadingProvider: SearchProvider = {
  empty: () => [],
  query: (q) => [{ key: 'loading', title: 'Wczytujemy katalog…', results: [catalogSearch(q)] }],
}

/** The product behind a result of the search (its preview), `null` for the other results. */
export function productOfResult(
  index: Pick<CatalogIndex, 'products'>,
  result: Pick<SearchResult, 'id'>,
): IndexProduct | null {
  if (!result.id.startsWith(PRODUCT_ID)) return null
  const slug = result.id.slice(PRODUCT_ID.length)
  return index.products.find((product) => product.slug === slug) ?? null
}

/**
 * The Biznes catalog in the shared search dialog (plan 0611 §8.1 pkt 5): products (typos and
 * inflections from the shared engine), „all results in the catalog”, categories, ready bundles,
 * pages and brands; the empty field shows shortcuts and the popular phrases from the panel.
 * The contact actions come from `paletteActions`, „Zapytaj o …” from the dialog.
 */
export function biznesSearchProvider(
  index: CatalogIndex,
  /** Phrases of the procurement pages from the panel (plan 0611 §6.4 #10), published only. */
  supply: readonly SupplySearchEntry[] = [],
): SearchProvider {
  const prepared = prepareSearch(index)
  const categoryName = new Map(index.categories.map((category) => [category.slug, category.name]))
  const brandName = new Map(index.brands.map((brand) => [brand.slug, brand.name]))
  const subtitle = (product: IndexProduct) =>
    [
      product.categories[0] && categoryName.get(product.categories[0]),
      product.brand && brandName.get(product.brand),
    ]
      .filter(Boolean)
      .join(' · ')

  return {
    popular: index.search.popular,

    empty() {
      const categories = SHORTCUT_CATEGORIES.flatMap((slug): SearchResult[] => {
        const category = index.categories.find((item) => item.slug === slug)
        return category
          ? [
              {
                id: `c:${slug}`,
                title: category.name,
                hint: resultsLabel(category.count),
                href: categoryHref(slug),
                icon: category.icon ?? 'grid',
              },
            ]
          : []
      })
      return [
        {
          key: 'shortcuts',
          title: 'Na skróty',
          results: [
            ...categories,
            CONFIGURATOR,
            {
              id: 'plan',
              title: 'Plan Twojej firmy',
              hint: 'Kliknij urządzenie na planie lokalu',
              href: PLAN_PATH,
              icon: 'map',
            },
          ],
        },
      ]
    },

    query(q) {
      const products = searchProducts(prepared, q) ?? []
      const pages = matchPages(index, q)
      const groups: SearchGroup[] = [
        {
          key: 'supply',
          title: 'Zaopatrzenie firm',
          results: matchSupplySearch(supply, q).map((entry) => ({
            id: `zaop:${entry.kind}`,
            title: entry.title,
            href: entry.href,
            icon: 'box',
          })),
        },
        {
          key: 'configurator',
          title: 'Dobierz rozwiązanie',
          results: asksForConfigurator(q) ? [CONFIGURATOR] : [],
        },
        {
          key: 'products',
          title: 'Produkty i usługi',
          results: products.length
            ? [
                ...products.slice(0, MAX_PRODUCTS).map((product): SearchResult => ({
                  id: `${PRODUCT_ID}${product.slug}`,
                  title: product.name,
                  hint: subtitle(product),
                  href: productHref(product.slug),
                  icon: cardIcon(product, index),
                })),
                {
                  id: 'all',
                  title: `Wszystkie wyniki w ofercie · ${resultsLabel(products.length)}`,
                  href: `/oferta?szukaj=${encodeURIComponent(q)}`,
                  icon: 'search',
                },
              ]
            : [],
        },
        {
          key: 'categories',
          title: 'Kategorie',
          results: matchCategories(index, prepared, products, q)
            .slice(0, MAX_CATEGORIES)
            .map((category) => ({
              id: `c:${category.slug}`,
              title: category.name,
              hint: resultsLabel(category.hits),
              href: categoryHref(category.slug),
              icon: category.icon ?? 'grid',
            })),
        },
        {
          key: 'bundles',
          title: 'Gotowe zestawy',
          results: pages
            .filter((page) => page.slug.startsWith('zestawy/'))
            .slice(0, MAX_BUNDLES)
            .map((page) => ({
              id: `z:${page.slug}`,
              title: page.title,
              href: `/${page.slug}`,
              icon: 'box',
            })),
        },
        {
          key: 'pages',
          title: 'Strony',
          results: pages
            .filter((page) => !page.slug.startsWith('zestawy/'))
            .slice(0, MAX_PAGES)
            .map((page) => ({
              id: `s:${page.slug}`,
              title: page.title,
              href: `/${page.slug}`,
              icon: 'doc',
            })),
        },
        {
          key: 'brands',
          title: 'Marki',
          results: matchBrands(index, q)
            .slice(0, MAX_BRANDS)
            .map((brand) => ({
              id: `m:${brand.slug}`,
              title: brand.name,
              href: brandTarget(brand) ?? brandHref(brand.slug),
              icon: 'sign',
            })),
        },
      ]
      return groups.filter((item) => item.results.length > 0)
    },
  }
}
