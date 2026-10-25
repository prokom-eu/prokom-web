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
 * Link columns of the Biznes footer, texts 1:1 from `boards/Main.dc.html`. `industries`: the
 * active industries with their full slugs. Editable in the panel afterwards.
 */
export function footerData(industries: { slug: string; name: string }[]): Footer {
  return {
    important: [
      { label: 'Opieka IT', href: '/opieka-it' },
      { label: 'GoPOS', href: '/gopos' },
      { label: 'InsERT', href: '/insert' },
      { label: 'Bezpłatny przegląd IT', href: '/opieka-it#przeglad' },
      { label: 'KSeF 2027', href: postHref(KSEF_POST_SLUG) },
      { label: 'Dobierz zestaw w 60 s →', href: '/kreator' },
    ],
    company: [
      ...industries.map(({ slug, name }) => ({ label: name, href: `/branze/${slug}` })),
      { label: 'O firmie', href: '/o-firmie' },
      { label: 'Aktualności', href: '/aktualnosci' },
      { label: 'Instalacje · Software · Tech · Zakopane', href: 'https://pro-kom.eu' },
    ],
  }
}
