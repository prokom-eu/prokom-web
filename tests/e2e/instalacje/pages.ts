// Every address of the Instalacje line (plan przyspieszenia §2 p. 3). A session adds its pages
// here — `strony.e2e.spec.ts`, `telefon.e2e.spec.ts` and the phone audit tool read this list.
// Plain TypeScript without path aliases: Node.js runs it as is (`audyt-telefon.mjs`).
export const INST_HOST = 'instalacje.localhost'

export const INST_PAGES: readonly string[] = [
  '/',
  '/anteny',
  '/monitoring',
  '/alarmy',
  '/kontrola-dostepu',
  '/sieci-wifi',
  '/teletechnika',
  '/smart-home',
  '/naglosnienie',
  '/ekrany',
  '/ladowarki-ev',
  // „Dla kogo” (I10).
  ...[
    'dom',
    'apartamenty',
    'pensjonaty',
    'hotele',
    'restauracje',
    'sklepy',
    'firmy',
    'koscioly',
    'szkoly',
    'gminy',
    'deweloperzy',
    'budowy',
  ].map((slug) => `/dla-kogo/${slug}`),
  // Formularze (I11).
  '/zaplanuj',
  '/kontakt',
  '/serwis',
  // Dla architektów (I16a).
  '/dla-architektow',
  // Oferta i Realizacje (I12).
  '/uslugi',
  '/realizacje',
  // O firmie, Poradnik i wpis RODO (I12).
  '/o-firmie',
  '/poradnik',
  '/poradnik/monitoring-a-rodo',
  // Strony prawne (I13).
  '/polityka-prywatnosci',
  '/cookies',
  '/dostepnosc',
]
