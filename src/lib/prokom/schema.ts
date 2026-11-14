import { z } from 'zod'

import { HUB_LINES } from './lines'

/*
 * Building blocks of the hub's page texts kept as JSON in `HubSettings` (ADR-H002 „Rozstrzygnięcia
 * H1” pkt 8, the pattern of `SoftwareSettings.home`): the panel stores one value, this schema checks it
 * on save and the loader reads it through the same schema.
 */

export const text = (max = 200) => z.string().trim().min(1).max(max)
export const optionalText = (max = 200) => z.string().trim().max(max).nullish()
export const key = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'małe litery, cyfry i myślniki')

/** A line of the hub, or `prokom` for the company itself (green). */
export const lineKey = z.enum([...HUB_LINES, 'prokom'])

/** A path of the hub (`/dla-firm`, `/wspolpraca#etapy`) or an anchor on the page (`#lista`). */
export const hubHref = z
  .string()
  .regex(/^(\/(?!\/)[a-z0-9/#-]*|#[a-z0-9-]+)$/, 'ścieżka /… albo kotwica #…')

export const titled = z.object({ title: text(90), text: text(300) })
export const faqItem = z.object({ question: text(160), answer: text(600) })
export const factItem = z.object({ value: text(40), label: text(90) })
export const nextItem = z.object({
  eyebrow: text(60),
  title: text(90),
  text: text(200),
  href: hubHref,
})

/** Keys of a list must be unique — the request list and presets rely on them. */
export const uniqueBy =
  <T>(pick: (item: T) => string, what: string) =>
  (items: T[], ctx: z.RefinementCtx) => {
    const seen = new Set<string>()
    items.forEach((item, index) => {
      const value = pick(item)
      if (seen.has(value)) {
        ctx.addIssue({ code: 'custom', path: [index], message: `${what} „${value}” jest dwa razy` })
      }
      seen.add(value)
    })
  }

/** Panel message of the first problem, or `true` (empty value = not set yet). */
export function firstIssue(schema: z.ZodType, value: unknown, name: string): true | string {
  if (value === null || value === undefined) return true
  const result = schema.safeParse(value)
  if (result.success) return true
  const [issue] = result.error.issues
  return `${name}: ${issue?.path.join('.') || '(całość)'} — ${issue?.message ?? 'błąd'}`
}

/** Phones, e-mails and street addresses — only from `CompanyData` / `SiteSettings` (spec §3). */
const CONTACT_DATA = /\d{3}[ -]?\d{3}[ -]?\d{3}|\d{2}[ -]\d{3}[ -]\d{2}[ -]\d{2}|@|\bul\.\s/

/** A page's JSON must not carry contact data; the FAQ of the home page uses tokens instead. */
export const noContactData = (value: unknown, ctx: z.RefinementCtx) => {
  const found = JSON.stringify(value).match(CONTACT_DATA)
  if (found) {
    ctx.addIssue({
      code: 'custom',
      message: `dane kontaktowe („${found[0]}”) tylko z danych firmy — użyj {telefon}, {adres}, {godziny}`,
    })
  }
}

/** Company facts (`HubSettings.trust` values) a text repeats; all must be visible to show it. */
export const factKeys = z.array(z.string().trim().min(1).max(40)).max(4)

/** Items whose facts are not all visible (on production: approved) are left out (spec §3). */
export function withVisibleFacts<T extends { facts: readonly string[] }>(
  items: readonly T[],
  visibleFacts: readonly { value: string }[],
): T[] {
  const visible = new Set(visibleFacts.map((row) => row.value))
  return items.filter((item) => item.facts.every((fact) => visible.has(fact)))
}
