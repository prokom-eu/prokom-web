import { brandHref } from '../catalog/brand'
import { BUNDLES_PATH, bundleHref } from '../catalog/bundle'
import { productHref } from '../catalog/card'
import { categoryHref, subcategoryHref } from '../catalog/category'
import { BRANDS_PATH, CATALOG_PATH } from '../catalog/filters'
import { industryHref } from '../catalog/industry'
import { objectHref } from '../instalacje/menu'
import { HOME_SLUG, pagePath } from '../pages/slug'
import { NEWS_PATH, postHref } from '../posts/list'
import { CATALOG_PATH as SOLUTIONS_PATH } from '../software/catalog'
import { industryPageHref } from '../software/industryPage'
import { WIZARD_PATH } from '../software/wizardFlow'

export const SITE_MAP_PATH = '/mapa-strony'

export type SiteMapLink = { href: string; label: string; updatedAt?: string | null }

export type SiteMapSection = {
  id: string
  title: string
  links: SiteMapLink[]
  /** Sub-lists under the section (products by category). */
  groups?: { title: string; links: SiteMapLink[] }[]
}

type Dated = { updatedAt?: string | null }

export type SiteMapInput = {
  pages: readonly ({ slug: string; title: string } & Dated)[]
  /** Biznes catalog; `null` on lines without it. */
  catalog: {
    /** Subcategories with a `slug` have their own page (K3b′). */
    categories: readonly {
      slug: string
      name: string
      subcategories?: readonly { name: string; slug?: string }[]
    }[]
    /** Brands with a page `/marki/[slug]` (K3b′); the loader keeps only those. */
    brands?: readonly { slug: string; name: string }[]
    industries: readonly { slug: string; name: string; active: boolean }[]
    /**
     * Ready bundles (K3c): `null`/absent = no `/zestawy`; the list holds only those „Gotowe” —
     * „Do sprawdzenia” are `noindex` (K3-KATALOG §7).
     */
    bundles?: readonly { slug: string; name: string }[] | null
    /** `categories[0]` is the main category. */
    products: readonly ({ slug: string; name: string; categories: readonly string[] } & Dated)[]
  } | null
  /** Posts of a line with news; `null` on lines without it. */
  news: { posts: readonly ({ slug: string; title: string } & Dated)[] } | null
  /** Software: the catalog and the page of every published solution (SW10); absent elsewhere. */
  solutions?: { items: readonly { slug: string; name: string }[] } | null
  /** Software: active industry pages `/dla-branz/[branza]` (SW10b); absent elsewhere. */
  industryPages?: readonly { slug: string; name: string }[] | null
  /** Instalacje: published object pages `/dla-kogo/[obiekt]` (I10); absent elsewhere. */
  objectPages?: readonly ({ slug: string; name: string } & Dated)[] | null
}

const byLabel = (a: SiteMapLink, b: SiteMapLink) => a.label.localeCompare(b.label, 'pl')

/**
 * Every public address of one site, grouped for `/mapa-strony` (spec. §2) — the same list that
 * `sitemap.xml` writes out (`siteMapPaths`), so the two cannot drift apart. Built only from what
 * the loaders return for the site's own tenant; filtered views are never listed (`noindex`).
 */
export function buildSiteMap({
  pages,
  catalog,
  news,
  solutions,
  industryPages,
  objectPages,
}: SiteMapInput): SiteMapSection[] {
  const home = pages.find((page) => page.slug === HOME_SLUG)
  const sections: SiteMapSection[] = [
    {
      id: 'strony',
      title: 'Strony',
      links: [
        ...(home ? [{ href: '/', label: 'Strona główna', updatedAt: home.updatedAt }] : []),
        ...pages
          .filter((page) => page.slug !== HOME_SLUG)
          .map((page) => ({
            href: pagePath(page.slug),
            label: page.title,
            updatedAt: page.updatedAt,
          }))
          .sort(byLabel),
        { href: SITE_MAP_PATH, label: 'Mapa strony' },
      ],
    },
  ]

  if (objectPages && objectPages.length > 0) {
    sections.push({
      id: 'dla-kogo',
      title: 'Dla kogo',
      links: objectPages.map((object) => ({
        href: objectHref(object.slug),
        label: object.name,
        updatedAt: object.updatedAt,
      })),
    })
  }

  if (catalog) {
    sections.push({
      id: 'oferta',
      title: 'Oferta',
      links: [
        { href: CATALOG_PATH, label: 'Cały katalog' },
        ...catalog.categories.flatMap((category) => [
          { href: categoryHref(category.slug), label: category.name },
          ...(category.subcategories ?? []).flatMap(({ name, slug }) =>
            slug ? [{ href: subcategoryHref(category.slug, slug), label: name }] : [],
          ),
        ]),
      ],
    })
    const brands = catalog.brands ?? []
    if (brands.length > 0) {
      sections.push({
        id: 'marki',
        title: 'Marki',
        links: [
          { href: BRANDS_PATH, label: 'Wszystkie marki' },
          ...brands.map((brand) => ({ href: brandHref(brand.slug), label: brand.name })),
        ],
      })
    }
    if (catalog.bundles) {
      sections.push({
        id: 'zestawy',
        title: 'Gotowe zestawy',
        links: [
          { href: BUNDLES_PATH, label: 'Wszystkie zestawy' },
          ...catalog.bundles.map((bundle) => ({
            href: bundleHref(bundle.slug),
            label: bundle.name,
          })),
        ],
      })
    }
    // „Wkrótce” industries have no page (ADR-012 rozstrz. 7).
    const industries = catalog.industries.filter((industry) => industry.active)
    if (industries.length > 0) {
      sections.push({
        id: 'branze',
        title: 'Branże',
        links: industries.map((industry) => ({
          href: industryHref(industry.slug),
          label: industry.name,
        })),
      })
    }
    const listed = new Set(catalog.categories.map((category) => category.slug))
    const productLinks = (filter: (main: string | undefined) => boolean) =>
      catalog.products
        .filter((product) => filter(product.categories[0]))
        .map((product) => ({
          href: productHref(product.slug),
          label: product.name,
          updatedAt: product.updatedAt,
        }))
        .sort(byLabel)
    // A published product keeps its address even when its main category is not listed (no
    // group, removed category): „Pozostałe”, so it stays in the map and in `sitemap.xml`.
    const groups = [
      ...catalog.categories.map((category) => ({
        title: category.name,
        links: productLinks((main) => main === category.slug),
      })),
      { title: 'Pozostałe', links: productLinks((main) => !main || !listed.has(main)) },
    ].filter((group) => group.links.length > 0)
    if (groups.length > 0) {
      sections.push({ id: 'produkty', title: 'Produkty i usługi', links: [], groups })
    }
  }

  if (solutions) {
    sections.push({
      id: 'rozwiazania',
      title: 'Rozwiązania',
      links: [
        { href: SOLUTIONS_PATH, label: 'Pełna oferta' },
        { href: WIZARD_PATH, label: 'Dobierz rozwiązanie' },
        ...solutions.items
          .map((item) => ({ href: `${SOLUTIONS_PATH}/${item.slug}`, label: item.name }))
          .sort(byLabel),
      ],
    })
  }

  if (industryPages && industryPages.length > 0) {
    sections.push({
      id: 'dla-branz',
      title: 'Dla branż',
      links: industryPages.map((industry) => ({
        href: industryPageHref(industry.slug),
        label: industry.name,
      })),
    })
  }

  if (news) {
    sections.push({
      id: 'aktualnosci',
      title: 'Aktualności',
      links: [
        { href: NEWS_PATH, label: 'Wszystkie wpisy' },
        ...news.posts.map((post) => ({
          href: postHref(post.slug),
          label: post.title,
          updatedAt: post.updatedAt,
        })),
      ],
    })
  }
  return sections
}

/** The addresses of the map for `sitemap.xml`, each once, in the map's order. */
export function siteMapPaths(
  sections: readonly SiteMapSection[],
): { path: string; updatedAt?: string | null }[] {
  const paths = new Map<string, string | null | undefined>()
  for (const section of sections) {
    for (const link of [...section.links, ...(section.groups ?? []).flatMap((g) => g.links)]) {
      if (!paths.has(link.href)) paths.set(link.href, link.updatedAt)
    }
  }
  return [...paths].map(([path, updatedAt]) => ({ path, updatedAt }))
}
