import { postHref } from '../../lib/posts/list'
import type { SiteSetting } from '@/payload-types'

import { KSEF_POST_SLUG } from './posts'

type Footer = NonNullable<NonNullable<SiteSetting['biznes']>['footer']>
type Link = { label: string; href: string }

/** Description of the first footer column (`Main` design), kept in `footer.text`. */
export const FOOTER_TEXT =
  'Kasy fiskalne, systemy POS, terminale, programy, KSeF, komputery, sieć, kopie danych i opieka IT dla firm z Podhala i Małopolski. PRO-KOM Tadeusz Wójciak, Rabka-Zdrój, od 2004.'

/** Bottom row of the footer, kept in `footer.links`. */
export const FOOTER_LEGAL_LINKS: Link[] = [
  { label: 'Mapa strony', href: '/mapa-strony' },
  { label: 'Polityka prywatności', href: '/polityka-prywatnosci' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Dostępność', href: '/dostepnosc' },
]

/**
 * „Najważniejsze” of the K3.1 footer (K31-ZMIANY §11.4). „Bezpłatny przegląd IT” is hidden while
 * the service waits for the boss's approval.
 */
export function footerImportant(): Link[] {
  return [
    { label: 'Opieka IT', href: '/opieka-it' },
    { label: 'GoPOS', href: '/gopos' },
    { label: 'InsERT i KSeF', href: '/insert' },
    { label: 'KSeF 2027', href: postHref(KSEF_POST_SLUG) },
    { label: 'Dobierz zestaw w 60 s', href: '/kreator' },
  ]
}

/**
 * „Najważniejsze” as the seed wrote it before K3.1 (B3b, `boards/Main.dc.html`), each link
 * with every address the seed ever gave it: „KSeF 2027” pointed to `/aktualnosci` before the
 * KSeF post existed.
 */
function legacyImportant(): { label: string; hrefs: string[] }[] {
  return [
    { label: 'Opieka IT', hrefs: ['/opieka-it'] },
    { label: 'GoPOS', hrefs: ['/gopos'] },
    { label: 'InsERT', hrefs: ['/insert'] },
    { label: 'Bezpłatny przegląd IT', hrefs: ['/opieka-it#przeglad'] },
    { label: 'KSeF 2027', hrefs: ['/aktualnosci', postHref(KSEF_POST_SLUG)] },
    { label: 'Dobierz zestaw w 60 s →', hrefs: ['/kreator'] },
  ]
}

/**
 * New „Najważniejsze” for a column still as the old seed wrote it (labels and addresses);
 * `null` when anything was edited in the panel (the panel wins) or it is already current.
 */
export function upgradedImportant(current: readonly Link[] | null | undefined): Link[] | null {
  const legacy = legacyImportant()
  const untouched =
    current?.length === legacy.length &&
    current.every(
      (link, i) => link.label === legacy[i].label && legacy[i].hrefs.includes(link.href),
    )
  return untouched ? footerImportant() : null
}

/**
 * Link columns of the Biznes footer (`boards/Main.dc.html`, K3.1 changes in K31-ZMIANY §11.4).
 * `industries`: the active industries with their full slugs. Editable in the panel afterwards.
 */
export function footerData(industries: { slug: string; name: string }[]): Footer {
  return {
    important: footerImportant(),
    company: [
      ...industries.map(({ slug, name }) => ({ label: name, href: `/branze/${slug}` })),
      { label: 'O firmie', href: '/o-firmie' },
      { label: 'Aktualności', href: '/aktualnosci' },
      { label: 'Instalacje · Software · Tech · Zakopane', href: 'https://pro-kom.eu' },
    ],
  }
}
