import { HUB_DESCRIPTIONS } from './seo'

export type HubLlmsInput = {
  origin: string
  /** Legal name from `CompanyData`. */
  company: string
  phone: string | null
  email: string | null
  address: string | null
  hours: string | null
  /** Lines of the hub in its order; a line without a site (`url`) is left out. */
  lines: readonly {
    name: string
    url: string | null
    description: string | null
    phone: string | null
  }[]
  /** Built pages of the hub (`hubMapPages`), paths from `/`. */
  pages: readonly { href: string; label: string }[]
}

/** A line ends with one full stop. */
const sentence = (text: string) => (/[.!?]$/.test(text) ? text : `${text}.`)

/** `https://prokomserwis.pl` and `https://prokomserwis.pl/` read the same. */
const withSlash = (url: string) => (url.endsWith('/') ? url : `${url}/`)

/**
 * `llms.txt` of pro-kom.eu (llmstxt.org, SEO czaty AI 23.11): who PRO-KOM is, the contact of the
 * salon and every line with its own site — so an AI assistant asked about PRO-KOM or a need in
 * Rabka sends the reader to the right line. No prices or promises beyond the hub's own texts
 * (spec §3); contact data only from the panel.
 */
export function hubLlmsTxt(input: HubLlmsInput): string {
  const url = (path: string) => `${input.origin}${path}`
  const lines = input.lines.filter((line) => line.url)
  return [
    '# PRO-KOM',
    '',
    `> ${HUB_DESCRIPTIONS['/']}`,
    '',
    `- Firma: ${input.company}, Rabka-Zdrój (Podhale, Małopolska).`,
    ...(input.address ? [`- Salon: ${input.address}.`] : []),
    ...(input.phone ? [`- Telefon: ${input.phone}`] : []),
    ...(input.email ? [`- E-mail: ${input.email}`] : []),
    ...(input.hours ? [`- Godziny: ${input.hours}`] : []),
    '',
    '## Linie PRO-KOM',
    '',
    ...lines.map((line) => {
      const details = [
        line.description ? sentence(line.description) : null,
        line.phone ? `Telefon: ${line.phone}.` : null,
      ].filter(Boolean)
      const link = `[${line.name}](${withSlash(line.url ?? '')})`
      return details.length ? `- ${link}: ${details.join(' ')}` : `- ${link}`
    }),
    '',
    '## Strony',
    '',
    ...input.pages.map((page) => `- [${page.label}](${url(page.href)})`),
    '',
  ].join('\n')
}
