import { postHref } from '../../lib/posts/list'
import { productHref } from '../../lib/catalog/card'
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
 * „Usługi” of the K4 footer (K36 §1, kept in `footer.important`): the service cards of
 * „Serwis i usługi” and the Opieka IT page.
 */
export function footerServices(): Link[] {
  return [
    { label: 'Przegląd kasy fiskalnej', href: productHref('przeglad-kasy-fiskalnej') },
    {
      label: 'Serwis kas i drukarek fiskalnych',
      href: productHref('serwis-kas-i-drukarek-fiskalnych'),
    },
    { label: 'Fiskalizacja kasy', href: productHref('fiskalizacja') },
    { label: 'Serwis komputerów', href: productHref('serwis-komputerow-dla-firm') },
    { label: 'Opieka IT', href: '/opieka-it' },
    { label: 'Kopie zapasowe', href: productHref('kopie-zapasowe') },
    { label: 'Poczta firmowa i Microsoft 365', href: productHref('m365-poczta') },
  ]
}

/**
 * „Systemy i tematy” of the K4 footer (K36 §1, kept in `footer.company`). KSeF leads to its post
 * until the `/ksef` page and „Ulga na kasę” joins with its page (both K4j).
 */
export function footerTopics(): Link[] {
  return [
    { label: 'GoPOS', href: '/gopos' },
    { label: 'InsERT i KSeF', href: '/insert' },
    { label: 'KSeF', href: postHref(KSEF_POST_SLUG) },
    { label: 'Automaty vendingowe', href: '/oferta/automaty-vendingowe' },
    { label: 'O firmie', href: '/o-firmie' },
    { label: 'Aktualności', href: '/aktualnosci' },
  ]
}

/** „Najważniejsze” of K3.1 (K31-ZMIANY §11.4), the column before K4. */
function k31Important(): Link[] {
  return [
    { label: 'Opieka IT', href: '/opieka-it' },
    { label: 'GoPOS', href: '/gopos' },
    { label: 'InsERT i KSeF', href: '/insert' },
    { label: 'KSeF 2027', href: postHref(KSEF_POST_SLUG) },
    { label: 'Dobierz zestaw w 60 s', href: '/kreator' },
  ]
}

/**
 * „Najważniejsze” as the seed wrote it before K3.1 (B3b), each link with every address the seed
 * ever gave it: „KSeF 2027” pointed to `/aktualnosci` before the KSeF post existed.
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

const sameLinks = (a: readonly Link[], b: readonly Link[]) =>
  a.length === b.length &&
  a.every((link, i) => link.label === b[i]!.label && link.href === b[i]!.href)

/**
 * „Usługi” for the column still as an earlier seed wrote it (B3b or K3.1 „Najważniejsze”);
 * `null` when anything was edited in the panel (the panel wins) or it is already current.
 */
export function upgradedImportant(current: readonly Link[] | null | undefined): Link[] | null {
  if (!current) return null
  const legacy = legacyImportant()
  const b3b =
    current.length === legacy.length &&
    current.every(
      (link, i) => link.label === legacy[i]!.label && legacy[i]!.hrefs.includes(link.href),
    )
  return b3b || sameLinks(current, k31Important()) ? footerServices() : null
}

/** The seed's „Branże i firma” (before K4): industry pages, then these three links. */
const LEGACY_COMPANY_TAIL: Link[] = [
  { label: 'O firmie', href: '/o-firmie' },
  { label: 'Aktualności', href: '/aktualnosci' },
  { label: 'Instalacje · Software · Tech · Zakopane', href: 'https://pro-kom.eu' },
]

/**
 * „Systemy i tematy” for the column still as the seed wrote „Branże i firma” (industries + the
 * three links); `null` when edited in the panel or already current.
 */
export function upgradedCompany(current: readonly Link[] | null | undefined): Link[] | null {
  if (!current || current.length < LEGACY_COMPANY_TAIL.length) return null
  const head = current.slice(0, -LEGACY_COMPANY_TAIL.length)
  const tail = current.slice(-LEGACY_COMPANY_TAIL.length)
  const untouched =
    sameLinks(tail, LEGACY_COMPANY_TAIL) && head.every((link) => link.href.startsWith('/branze/'))
  return untouched ? footerTopics() : null
}

/** Link columns of the Biznes footer (K4, K36 §1). Editable in the panel afterwards. */
export function footerData(): Footer {
  return { important: footerServices(), company: footerTopics() }
}
