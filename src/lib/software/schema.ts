import { z } from 'zod'

import { isValidNavHref } from '../site/link'

/**
 * Building blocks of the Software JSON settings (navigation, wizard, home texts — ADR-014
 * rozstrz. SW0 7, v20 4–7). The shapes follow the seed package 1:1 (`seed/prokomsoftware/`), so
 * the seed is stored as it is. Objects are strict: a mistyped key in the panel is an error, not
 * silently lost data; `_info` (notes of the design package) is allowed everywhere.
 */

/** Strict object that also allows the package's `_info` note. */
export function obj<T extends z.ZodRawShape>(shape: T) {
  return z.strictObject({ ...shape, _info: z.string().optional() })
}

/** Short text: labels, titles, buttons. */
export const label = z.string().trim().min(1).max(160)

/** Longer text: leads, answers, notes. */
export const text = z.string().trim().min(1).max(1200)

/** Lowercase id of the package (`pensjonat`, `zimaBig`, `www`). */
export const key = z.string().regex(/^[a-zA-Z0-9]+(?:[-_][a-zA-Z0-9]+)*$/)

/** Solution slug (`Solutions.slug`). */
export const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

/** Link of the navigation: a path, https://, mailto:, tel: or an anchor on the page (`#kontakt`). */
export const href = z
  .string()
  .refine((value) => /^#[a-z0-9-]+$/.test(value) || isValidNavHref(value), {
    message: 'Ścieżka (/kontakt), kotwica (#kontakt), adres https://, mailto: albo tel:.',
  })

/**
 * SVG path data of a line icon — the package draws its icons inline. Only path commands and
 * numbers, so nothing else can reach the `d` attribute.
 */
export const svgPath = z.string().regex(/^[MmLlHhVvCcSsQqTtAaZz0-9 .,-]+$/, 'Ścieżka SVG (d=…).')

/** `[label, href]` — the package keeps links as pairs. */
export const link = z.tuple([label, href])

/** `[label, href, note?]` — a link with a small badge („0 zł”). */
export const linkWithNote = z.tuple([label, href]).rest(label)

/** `true` or the first problem, readable in the panel (`validate` of a JSON field). */
export function firstIssue(schema: z.ZodType, value: unknown, name: string): true | string {
  if (value === null || value === undefined) return true
  const result = schema.safeParse(value)
  if (result.success) return true
  const [issue] = result.error.issues
  return `${name}: ${issue?.path.join('.') || '(całość)'} — ${issue?.message ?? 'błąd'}`
}
