import { AREA_SERVED } from './seo'

type Input = {
  origin: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  services: readonly { name: string; href: string | null; description: string }[]
  objects: readonly { name: string; href: string }[]
}

/** Pages every reader should know, in the order of the site (SEO §2.4). */
const PAGES = [
  ['Pełna oferta', '/uslugi'],
  ['Zaplanuj instalację (kreator)', '/zaplanuj'],
  ['Serwis i przeglądy', '/serwis'],
  ['Dla architektów i deweloperów', '/dla-architektow'],
  ['Realizacje', '/realizacje'],
  ['Poradnik', '/poradnik'],
  ['O firmie', '/o-firmie'],
  ['Kontakt i dojazd', '/kontakt'],
] as const

/**
 * `llms.txt` of the Instalacje site (SEO §2.4, llmstxt.org format): who we are, what we do, where,
 * how to reach us and the main pages — a cheap signal for AI assistants. Only facts the site
 * already shows (spec §2: no prices, 24-month warranty, „24 h” = the answer to an inquiry).
 */
export function llmsTxt(input: Input): string {
  const url = (path: string) => `${input.origin}${path}`
  const lines = [
    `# ${input.name}`,
    '',
    '> Monitoring, alarmy, kontrola dostępu, sieci i Wi-Fi, teletechnika, anteny, smart home Ampio, nagłośnienie, ekrany i ładowarki EV na Podhalu i w Małopolsce. Projekt, montaż i serwis jednej firmy z Rabki-Zdroju (PRO-KOM Tadeusz Wójciak, od 2004 roku).',
    '',
    '- Wycena po wizji lokalnej, na piśmie; strona nie podaje cen sprzętu.',
    '- Gwarancja 24 miesiące na montaż. Na zgłoszenie odpowiadamy do 24 h w dni robocze.',
    `- Obszar: ${AREA_SERVED.join(', ')} i okolice; dalej w Małopolsce dojazd ustalamy indywidualnie.`,
    ...(input.address ? [`- Salon: ${input.address}.`] : []),
    ...(input.phone ? [`- Telefon: ${input.phone}`] : []),
    ...(input.email ? [`- E-mail: ${input.email}`] : []),
    '',
    '## Usługi',
    '',
    ...input.services.map((s) =>
      s.href ? `- [${s.name}](${url(s.href)}): ${s.description}` : `- ${s.name}: ${s.description}`,
    ),
    '',
    '## Dla kogo',
    '',
    ...input.objects.map((o) => `- [${o.name}](${url(o.href)})`),
    '',
    '## Strony',
    '',
    ...PAGES.map(([label, path]) => `- [${label}](${url(path)})`),
    '',
  ]
  return lines.join('\n')
}
