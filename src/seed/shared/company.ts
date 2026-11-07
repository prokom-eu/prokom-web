import type { CompanyDatum } from '../../payload-types'
import { CONSENT_CLAUSE } from '../../lib/inquiry/consent'

/**
 * The company, one copy for every line (spec §4.1, `CompanyData`). Real data, also for local
 * databases; every seed that writes `company-data` takes it from here, so imports of different
 * lines never undo each other. Shared phones and e-mail are not set here: each line shows its own.
 */
export const COMPANY_NAME = 'PRO-KOM Tadeusz Wójciak'
export const COMPANY_NIP = '7352511447'
export const COMPANY_ADDRESS = {
  street: 'ul. Orkana 16B',
  postalCode: '34-700',
  city: 'Rabka-Zdrój',
} as const

const fullAddress = `${COMPANY_ADDRESS.street}, ${COMPANY_ADDRESS.postalCode} ${COMPANY_ADDRESS.city}`

/**
 * One salon (Rabka-Zdrój). The Instalacje decision of 01.11.2026: no salon in Zakopane — Zakopane
 * stays a town of a service zone and an unpublished line. TODO(krystian): [SZEF] parking note.
 */
export const COMPANY_LOCATIONS: CompanyDatum['locations'] = [
  {
    key: 'rabka',
    name: 'Rabka-Zdrój',
    published: true,
    ...COMPANY_ADDRESS,
    // Point of the Software v23 OSM map (`scripts/software-osm-map.mjs`, TARGET).
    geo: { lat: 49.60994, lng: 19.95339 },
    // Saturday and Sunday closed: days without a row.
    hours: [{ days: ['mon', 'tue', 'wed', 'thu', 'fri'], opens: '09:00', closes: '17:00' }],
  },
]

/** Lines and brands (spec §4.1, §2.4): Gaming until its start (20.11) and Zakopane unpublished. */
export const COMPANY_LINES: NonNullable<CompanyDatum['lines']> = [
  {
    key: 'prokom',
    name: 'PRO-KOM',
    kind: 'linia',
    order: 0,
    domain: 'pro-kom.eu',
    url: 'https://pro-kom.eu',
    color: '#45A02C',
    colorOnDark: '#4FB034',
    description: 'Wszystkie linie PRO-KOM',
    descriptionLong: 'Strona główna firmy — wszystkie linie PRO-KOM w jednym miejscu.',
    published: true,
  },
  {
    key: 'biznes',
    name: 'Biznes',
    kind: 'linia',
    order: 1,
    domain: 'prokombiznes.pl',
    url: 'https://prokombiznes.pl',
    logoLabel: 'BIZNES',
    color: '#244FB0',
    colorOnDark: '#4A7BE0',
    description: 'Kasy, komputery, opieka IT',
    descriptionLong: 'Kasy, programy, komputery i opieka IT dla firm.',
    published: true,
  },
  {
    key: 'instalacje',
    name: 'Instalacje',
    kind: 'linia',
    order: 2,
    domain: 'prokominstalacje.pl',
    url: 'https://prokominstalacje.pl',
    logoLabel: 'INSTALACJE',
    color: '#0093B3',
    colorOnDark: '#12B6D8',
    description: 'Monitoring, sieci, smart home',
    descriptionLong: 'Monitoring, alarmy, sieci, smart home, nagłośnienie.',
    published: true,
  },
  {
    key: 'software',
    name: 'Software',
    kind: 'linia',
    order: 3,
    domain: 'prokomsoftware.pl',
    url: 'https://prokomsoftware.pl',
    logoLabel: 'SOFTWARE',
    color: '#8B61E3',
    colorOnDark: '#9670EE',
    description: 'Strony, systemy, aplikacje',
    descriptionLong: 'Strony, systemy, aplikacje i automatyzacje.',
    published: true,
  },
  {
    key: 'tech',
    name: 'Tech',
    kind: 'linia',
    order: 4,
    domain: 'prokomserwis.pl',
    url: 'https://prokomserwis.pl',
    logoLabel: 'TECH',
    color: '#D13A2E',
    colorOnDark: '#E2483A',
    description: 'Naprawy telefonów i komputerów',
    descriptionLong: 'Naprawy telefonów, laptopów i komputerów.',
    published: true,
  },
  {
    key: 'zakopane',
    name: 'Zakopane',
    kind: 'linia',
    order: 5,
    logoLabel: 'ZAKOPANE',
    color: '#DD8600',
    colorOnDark: '#F29A00',
    published: false,
  },
  {
    key: 'gaming',
    name: 'Gaming',
    kind: 'marka',
    order: 6,
    domain: 'prokomgaming.pl',
    url: 'https://prokomgaming.pl',
    color: '#F2C230',
    colorOnDark: '#F2C230',
    description: 'Komputery gamingowe · marka PRO-KOM',
    descriptionLong: 'Komputery gamingowe składane i testowane w Rabce.',
    published: false,
  },
]

/**
 * Service zones: the four zones of the Instalacje contact map (`dane/kontakt.ts`, towns of
 * `kontaktModel.ts`), now one list for every line. TODO(krystian): [SZEF] potwierdzić listę.
 */
export const COMPANY_ZONES: NonNullable<CompanyDatum['serviceZones']> = [
  {
    name: 'Rabka-Zdrój i okolice',
    towns: ['Rabka-Zdrój', 'Chabówka', 'Jordanów', 'Mszana Dolna'],
    note: 'Najbliżej salonu w Rabce.',
  },
  {
    name: 'Podhale',
    towns: ['Nowy Targ', 'Szaflary', 'Raba Wyżna', 'Czarny Dunajec', 'Szczawnica', 'Krościenko'],
    note: 'Dojazd z Rabki-Zdroju.',
  },
  {
    name: 'Zakopane i Tatry',
    towns: ['Zakopane', 'Poronin', 'Kościelisko', 'Białka Tatrzańska', 'Bukowina Tatrzańska'],
    note: 'Dojeżdżamy z Rabki-Zdroju.',
  },
  {
    name: 'Małopolska',
    towns: ['Limanowa', 'Maków Podhalański', 'Myślenice', 'Nowy Sącz', 'Kraków'],
    note: 'Przy większych inwestycjach jedziemy dalej. Dojazd ustalamy indywidualnie.',
  },
]

/** Everything the seed keeps up to date in `CompanyData` (spec §4.1). */
export const SHARED_COMPANY = {
  name: COMPANY_NAME,
  nip: COMPANY_NIP,
  locations: COMPANY_LOCATIONS,
  mapsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`,
  // The public company search (also linked from the Biznes pages, `k4Pages.ts`).
  ceidgUrl: 'https://www.biznes.gov.pl/pl/wyszukiwarka-firm',
  legal: {
    privacy: '/polityka-prywatnosci',
    cookies: '/cookies',
    accessibility: '/dostepnosc',
    sitemap: '/mapa-strony',
  },
  // Today's clause; the forms move to these fields in D2/D3 (decision of the lawyer pending).
  consent: { mode: 'checkbox', version: CONSENT_CLAUSE.version, clause: CONSENT_CLAUSE.text },
  recentlyViewed: false,
  lines: COMPANY_LINES,
  serviceZones: COMPANY_ZONES,
} satisfies Partial<CompanyDatum>
