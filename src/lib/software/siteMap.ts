import type { SiteMapLink, SiteMapSection } from '../seo/siteLinks'
import { OFFER_GROUPS, CATALOG_PATH } from './catalog'
import { WIZARD_PATH } from './wizard/flow'

/** A card of the Software site map: its links, or the search button („Wyszukiwarka”). */
export type SiteMapGroup = {
  id: string
  title: string
  links: { href: string; label: string; external?: boolean }[]
  search?: boolean
}

type Input = {
  legal: { privacy: string; cookies: string; accessibility: string }
  /** Published lines of the company with an address; the current line is left out. */
  lines: readonly { key: string; name: string; url: string | null }[]
  currentLine: string
  /** The line has published posts (`/aktualnosci` exists). */
  hasNews: boolean
}

export const TERMS_PATH = '/regulamin'

/**
 * The six cards of `/mapa-strony` on Software (board `AU-mapa`, ZMIANY-v24 §9.6): start page
 * sections, offer groups (the four v24 groups, D10), tools, company, legal pages and the other
 * lines. Every address below them still comes from the sitemap list (`restOfSiteMap`).
 */
export function softwareSiteMapGroups({
  legal,
  lines,
  currentLine,
  hasNews,
}: Input): SiteMapGroup[] {
  const others = lines.filter((line) => line.key !== currentLine && line.url)
  return [
    {
      id: 'glowna',
      title: 'Strona główna',
      links: [
        { href: '/', label: 'Start' },
        { href: '/#sytuacje', label: 'Od czego zaczynasz' },
        { href: '/#oferta', label: 'Oferta w skrócie' },
        { href: '/#podglady', label: 'Podglądy na żywo' },
        { href: '/#technologia', label: 'Jak robimy strony' },
        { href: '/#cennik', label: 'Cennik' },
        { href: '/#proces', label: 'Jak pracujemy' },
        { href: '/#faq', label: 'Pytania' },
      ],
    },
    {
      id: 'oferta',
      title: 'Oferta',
      links: [
        { href: CATALOG_PATH, label: 'Pełna oferta' },
        ...OFFER_GROUPS.map((group) => ({
          href: `${CATALOG_PATH}?kategoria=${group.value}`,
          label: group.label,
        })),
        { href: '/cennik', label: 'Cennik' },
      ],
    },
    {
      id: 'narzedzia',
      title: 'Narzędzia',
      links: [
        { href: WIZARD_PATH, label: 'Kreator wyceny 60 s' },
        { href: '/audyt', label: 'Darmowy audyt strony' },
      ],
      search: true,
    },
    {
      id: 'firma',
      title: 'Firma',
      links: [
        { href: '/o-firmie', label: 'O firmie' },
        { href: '/o-firmie#linie', label: 'Jedna firma do wszystkiego' },
        ...(hasNews ? [{ href: '/aktualnosci', label: 'Aktualności' }] : []),
        { href: '/kontakt', label: 'Kontakt i dojazd' },
      ],
    },
    {
      id: 'informacje',
      title: 'Informacje',
      links: [
        { href: legal.privacy, label: 'Polityka prywatności' },
        { href: TERMS_PATH, label: 'Regulamin' },
        { href: legal.cookies, label: 'Pliki cookies' },
        { href: legal.accessibility, label: 'Deklaracja dostępności' },
      ],
    },
    ...(others.length
      ? [
          {
            id: 'linie',
            title: 'Linie PRO-KOM',
            links: others.map((line) => ({
              href: line.url as string,
              label: line.name,
              external: true,
            })),
          },
        ]
      : []),
  ]
}

const pathOf = (href: string) => href.split('#')[0]?.split('?')[0] || '/'

/**
 * The sitemap sections minus what the cards already link (same path): the solutions, industries,
 * cities, posts and any extra page of the panel stay listed, nothing twice. Empty sections go.
 */
export function restOfSiteMap(
  sections: readonly SiteMapSection[],
  groups: readonly SiteMapGroup[],
): SiteMapSection[] {
  const shown = new Set(groups.flatMap((group) => group.links.map((link) => link.href)))
  const keep = (link: SiteMapLink) => !shown.has(link.href) && !shown.has(pathOf(link.href))
  return sections
    .map((section) => ({
      ...section,
      links: section.links.filter(keep),
      groups: section.groups
        ?.map((group) => ({ ...group, links: group.links.filter(keep) }))
        .filter((group) => group.links.length > 0),
    }))
    .filter((section) => section.links.length > 0 || (section.groups?.length ?? 0) > 0)
}
