import type { Metadata } from 'next'

import { ogImages } from '../pages/metadata'
import type { PublicImage } from '../media/public'

/**
 * Meta descriptions of the hub's pages (spec §4: 140–160 characters; audit H8 P1 pkt 2). Plain
 * facts and the promises of spec §3 only — no prices, numbers or addresses (those live in the
 * panels).
 */
export const HUB_DESCRIPTIONS = {
  '/': 'PRO-KOM z Rabki-Zdroju od 2004 roku: kasy fiskalne i IT dla firm, instalacje, strony i programy, serwis telefonów i komputerów oraz sprzęt do gier.',
  '/linie':
    'Cała oferta PRO-KOM w jednym miejscu. Sprawdź, która linia zajmie się Twoją sprawą: kasy i IT, instalacje, strony i programy, serwis albo gaming.',
  '/dla-firm':
    'Kasa fiskalna, komputery, sieć, kamery i strona internetowa dla Twojej firmy z jednego miejsca. PRO-KOM z Rabki-Zdroju dobierze plan dla Twojej branży.',
  '/dla-domu':
    'Smart home, alarm i kamery, naprawa telefonu lub laptopa i komputer do gier. PRO-KOM z Rabki-Zdroju załatwi sprawy Twojego domu w jednej firmie.',
  '/inwestycje-i-dostawy':
    'Zamówienia publiczne, przetargi i większe dostawy sprzętu dla szkół, gmin, firm i hoteli. PRO-KOM przygotuje ofertę według SWZ albo Twojej listy.',
  '/wspolpraca':
    'Współpraca z PRO-KOM dla architektów, deweloperów, wykonawców, instytucji i dostawców: etapy, zakres prac i większe dostawy. Zróbmy to razem.',
  '/o-firmie':
    'PRO-KOM z Rabki-Zdroju działa od 2004 roku. Autoryzowany serwis Posnet i Elzab, partner InsERT i GoPOS: sprzęt, instalacje, oprogramowanie i serwis.',
  '/kontakt':
    'Kontakt z PRO-KOM w Rabce-Zdroju: jeden numer do firmy, telefony linii, godziny otwarcia salonu i formularz. Pokierujemy Cię do właściwej osoby.',
  '/mapa-strony':
    'Mapa strony pro-kom.eu: wszystkie podstrony w jednym miejscu, czyli oferta, strony dla firm i domu, dostawy, współpraca, kontakt i informacje o firmie.',
} as const

export type HubDescribedPath = keyof typeof HUB_DESCRIPTIONS

/**
 * Complete metadata of a hub page: title, description, canonical and Open Graph (a page's
 * `openGraph` replaces the layout's as a whole, so the picture is set here too — the panel's
 * „Obraz OG” or the hub's file, `defaultOgImage`).
 */
export function hubPageMetadata(
  path: HubDescribedPath,
  title: string,
  ogImage: PublicImage | null,
): Metadata {
  const description = HUB_DESCRIPTIONS[path]
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'pl_PL',
      siteName: 'PRO-KOM',
      url: path,
      title,
      description,
      images: ogImages(ogImage),
    },
  }
}
