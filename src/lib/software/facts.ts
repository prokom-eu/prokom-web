import { log } from '../log'
import { formatPrice } from './price'

/**
 * Facts [SZEF] and solution values in panel texts (ADR-014 §1.4, rozstrz. SW0 4, v20 10):
 * - `[KLUCZ]` — a fact from `SiteSettings.software.facts` (uppercase key, one value per site);
 * - `{termin}` — the term of the solution the text belongs to (`Solutions.leadTime`);
 * - `{cena:<slug>}` — the „od” price of that solution, e.g. „4 990 zł” („od”/„netto” stay in
 *   the sentence);
 * - `{termin:<slug>}` — the „od” term of that solution („od 5 tygodni”).
 * Other templates (`{cena}`, `{kontakt}`, `{n}` of the wizard) are left for their components.
 */
export type TextContext = {
  /** Tenant of the page — for the log line only. */
  tenantId: number
  facts: Readonly<Record<string, string>>
  /** „Od” prices (`priceFrom`) of the tenant's solutions by slug; `null` = no price. */
  prices: Readonly<Record<string, number | null>>
  /** „Od” terms (`leadTime`) of the tenant's solutions by slug, for `{termin:<slug>}`. */
  terms?: Readonly<Record<string, string | null>>
  /** Term of the solution the text belongs to; absent outside solution texts. */
  term?: string | null
  /** Production (`SITE_ENV=production`): a text with a missing value is not shown at all. */
  strict: boolean
}

const FACT_KEY_SOURCE = String.raw`[A-ZĄĆĘŁŃÓŚŹŻ][A-ZĄĆĘŁŃÓŚŹŻ0-9 -]*`

/** A fact key as typed in the panel, without brackets: `CZAS ODPOWIEDZI`. */
export const FACT_KEY = new RegExp(String.raw`^${FACT_KEY_SOURCE}$`)

const SLUG_SOURCE = String.raw`[a-z0-9]+(?:-[a-z0-9]+)*`

const TOKEN = new RegExp(
  String.raw`\[(${FACT_KEY_SOURCE})\]|\{termin\}|\{cena:(${SLUG_SOURCE})\}|\{termin:(${SLUG_SOURCE})\}`,
  'g',
)

/** Fills what it can; `missing` lists the tokens left as they were (for logs and the scan). */
export function resolveText(
  text: string,
  context: TextContext,
): { text: string; missing: string[] } {
  const missing: string[] = []
  const filled = text.replace(
    TOKEN,
    (token, factKey?: string, priceSlug?: string, termSlug?: string) => {
      let value: string | null = null
      if (factKey !== undefined) value = context.facts[factKey]?.trim() || null
      else if (priceSlug !== undefined) {
        const price = context.prices[priceSlug]
        value = price === null || price === undefined ? null : `${formatPrice(price)} zł`
      } else if (termSlug !== undefined) value = context.terms?.[termSlug]?.trim() || null
      else value = context.term?.trim() || null
      if (value === null) missing.push(token)
      return value ?? token
    },
  )
  return { text: filled, missing }
}

type Warn = Pick<typeof log, 'warn'>

/**
 * Tokens already reported, per tenant: a fact left empty on purpose (`null` = hidden, `fakty.json`)
 * would otherwise log on every page view and bury the real gaps. Once per process is enough.
 */
const reported = new Set<string>()

/**
 * Text for the page, or `null` = do not render the element: on production a sentence with a
 * missing value is dropped (a warning lists only the tokens, never the text); on staging and
 * locally the token stays visible, so the gap is noticed (spec. §10 pkt 9).
 */
export function fillText(
  text: string | null | undefined,
  context: TextContext,
  logger: Warn = log,
): string | null {
  if (!text) return text ?? null
  const result = resolveText(text, context)
  if (result.missing.length === 0) return result.text
  if (!context.strict) return result.text
  const fresh = result.missing.filter((token) => !reported.has(`${context.tenantId}:${token}`))
  if (fresh.length > 0) {
    for (const token of fresh) reported.add(`${context.tenantId}:${token}`)
    logger.warn(
      { tenant: context.tenantId, missing: fresh },
      'software text skipped: missing values',
    )
  }
  return null
}

/**
 * Every string of a stored document filled with `fill` (the page texts of `Solutions.page`,
 * `Industries`): a text the fill drops (`null`, a missing value on production) becomes `''`, so
 * the page builders skip it like an empty field.
 */
export function fillDeep(value: unknown, fill: (text: string) => string | null): unknown {
  if (typeof value === 'string') return fill(value) ?? ''
  if (Array.isArray(value)) return value.map((item) => fillDeep(item, fill))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, fillDeep(item, fill)]),
    )
  }
  return value
}

/** `SiteSettings.software.facts` rows → lookup by key; empty values are skipped. */
export function factsMap(
  rows: readonly { key?: string | null; value?: string | null }[] | null | undefined,
): Record<string, string> {
  const facts: Record<string, string> = {}
  for (const row of rows ?? []) {
    const key = row.key?.trim()
    const value = row.value?.trim()
    if (key && value) facts[key] = value
  }
  return facts
}

/**
 * The line's phones and e-mail (`SiteSettings.phone`, `phone2`, `email`) as the facts `[TELEFON]`,
 * `[TELEFON 2]` and `[E-MAIL]`, so a panel text can name them without a second copy (SWV2).
 */
export function contactFacts(settings: {
  phone?: string | null
  phone2?: string | null
  email?: string | null
}): Record<string, string> {
  const facts: Record<string, string> = {}
  const add = (key: string, value: string | null | undefined) => {
    const text = value?.trim()
    if (text) facts[key] = text
  }
  add('TELEFON', settings.phone)
  add('TELEFON 2', settings.phone2)
  add('E-MAIL', settings.email)
  return facts
}
