import { cardPrice } from './cardPrice'
import type { PriceDisplay } from './priceDisplay'
import type { IndexSolution } from './solutionsIndex'

type Solution = Pick<
  IndexSolution,
  'name' | 'slug' | 'lead' | 'priceFrom' | 'priceMonthly' | 'leadTime'
>

type Input = {
  origin: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  solutions: readonly Solution[]
  /** The price words of the panel (`SoftwareSettings.wizard.priceDisplay`), as on the cards. */
  priceDisplay: PriceDisplay
  industries: readonly { name: string; href: string }[]
  cities: readonly { name: string; href: string }[]
}

/** Pages every reader should know, in the order of the site. */
const PAGES = [
  ['Pełna oferta z cenami „od”', '/rozwiazania'],
  ['Cennik', '/cennik'],
  ['Dobierz rozwiązanie (kreator 60 s)', '/dobierz'],
  ['Darmowy audyt strony', '/audyt'],
  ['O firmie', '/o-firmie'],
  ['Kontakt', '/kontakt'],
] as const

/** „od 999 zł netto” / „Wycena po rozmowie” — the card's price. */
function priceOf(solution: Solution, display: PriceDisplay): string {
  const { head } = cardPrice(solution, display)
  return [head.before, head.amount, head.after].filter(Boolean).join(' ')
}

/** „od 999 zł netto, od 1 tygodnia” — the card's price and term (no term without a price). */
function priceText(solution: Solution, display: PriceDisplay): string {
  const { term, ask } = cardPrice(solution, display)
  const price = priceOf(solution, display)
  return ask ? price : `${price}, ${term}`
}

/** A line ends with one full stop, whatever its price ends with („/ mies.”). */
const sentence = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`)

/**
 * `llms.txt` of the Software site (llmstxt.org, SEO etap 1): who we are, what we build and for how
 * much, where we work — Rabka-Zdrój, Podhale, Małopolska and remotely all Poland — and the pages,
 * for AI assistants that answer „kto robi strony w Rabce / na Podhalu”. Prices, terms and the
 * cheapest care come from `Solutions` and the panel's price words, exactly as the cards show them.
 */
export function softwareLlmsTxt(input: Input): string {
  const url = (path: string) => `${input.origin}${path}`
  const monthly = input.solutions.filter((s) => s.priceMonthly && s.priceFrom !== null)
  const care = monthly.length
    ? monthly.reduce((low, s) => ((s.priceFrom ?? 0) < (low.priceFrom ?? 0) ? s : low))
    : null
  const lines = [
    `# ${input.name}`,
    '',
    '> Strony internetowe, sklepy, systemy dla firm, aplikacje i automatyzacje z Rabki-Zdroju (PRO-KOM Tadeusz Wójciak): projekt, wykonanie i opieka po starcie w jednym miejscu.',
    '',
    '- Obszar: Rabka-Zdrój, Podhale (Nowy Targ, Zakopane, Mszana Dolna), cała Małopolska, a zdalnie cała Polska.',
    '- Przy każdym rozwiązaniu cena „od” i termin; stała cena za zakres, wycena na piśmie.',
    '- Kod, panel i dane należą do klienta.',
    ...(care ? [`- ${care.name}: ${sentence(priceOf(care, input.priceDisplay))}`] : []),
    ...(input.address ? [`- Biuro: ${input.address}.`] : []),
    ...(input.phone ? [`- Telefon: ${input.phone}`] : []),
    ...(input.email ? [`- E-mail: ${input.email}`] : []),
    '',
    '## Oferta',
    '',
    ...input.solutions.map((s) => {
      const lead = s.lead ? ` ${s.lead}` : ''
      const link = `[${s.name}](${url(`/rozwiazania/${s.slug}`)})`
      return `- ${link}: ${sentence(priceText(s, input.priceDisplay))}${lead}`
    }),
    '',
    ...(input.industries.length
      ? ['## Dla branż', '', ...input.industries.map((i) => `- [${i.name}](${url(i.href)})`), '']
      : []),
    ...(input.cities.length
      ? ['## Miejscowości', '', ...input.cities.map((c) => `- [${c.name}](${url(c.href)})`), '']
      : []),
    '## Strony',
    '',
    ...PAGES.map(([label, path]) => `- [${label}](${url(path)})`),
    '',
  ]
  return lines.join('\n')
}
